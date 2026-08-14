import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

/**
 * Auto-escalate overdue pending activities.
 * Called by pg_cron every 5 minutes.
 * Auth: Supabase anon key in `apikey` header (matches pg_cron pattern).
 */
export const Route = createFileRoute("/api/public/hooks/auto-escalate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const providedSecret = request.headers.get("x-cron-secret") ?? "";

        const url = process.env.SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const admin = createClient(url, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: cfg } = await admin
          .from("cron_config")
          .select("cron_secret")
          .eq("id", 1)
          .maybeSingle();
        const expected = cfg?.cron_secret ?? "";
        // constant-time compare
        const a = new TextEncoder().encode(providedSecret);
        const b = new TextEncoder().encode(expected);
        let mismatch = a.length ^ b.length;
        for (let i = 0; i < Math.min(a.length, b.length); i++) mismatch |= a[i] ^ b[i];
        if (!expected || mismatch !== 0) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }

        const nowIso = new Date().toISOString();
        const DAY_MS = 86_400_000;

        // 1. Rolling activities that are not finished roll over to the next day.
        let rolled = 0;
        const { data: rolling } = await admin
          .from("activities")
          .select("id, start_at, end_at, respond_by, status, rollover_count")
          .eq("is_rolling", true)
          .in("status", ["pending", "confirmed", "declined", "auto_declined"])
          .lt("end_at", nowIso);

        for (const a of rolling ?? []) {
          const start = new Date(a.start_at).getTime();
          const end = new Date(a.end_at).getTime();
          // Shift forward in whole days until the end lands in the future.
          const daysBehind = Math.max(1, Math.ceil((Date.now() - end) / DAY_MS));
          const patch: Record<string, unknown> = {
            start_at: new Date(start + daysBehind * DAY_MS).toISOString(),
            end_at: new Date(end + daysBehind * DAY_MS).toISOString(),
            rollover_count: (a.rollover_count ?? 0) + 1,
            updated_at: nowIso,
          };
          if (a.status === "pending") {
            patch.respond_by = new Date(
              new Date(a.respond_by).getTime() + daysBehind * DAY_MS,
            ).toISOString();
          }
          const { error: rollErr } = await admin.from("activities").update(patch).eq("id", a.id);
          if (rollErr) {
            console.error("rollover failed", a.id, rollErr.message);
            continue;
          }
          rolled++;
          await admin.from("activity_audit_log").insert({
            activity_id: a.id,
            actor_id: null,
            action: "rolled_over",
            previous_status: a.status,
            new_status: a.status,
            note: `Lopende activiteit doorgeschoven: ${new Date(a.start_at).toLocaleString("nl-BE")} → ${new Date(
              start + daysBehind * DAY_MS,
            ).toLocaleString("nl-BE")}`,
          });
        }

        // 2. Overdue non-rolling activities are auto-declined and escalated.
        const { data: overdue, error: fetchErr } = await admin
          .from("activities")
          .select("id, title, assignee_id, respond_by, status")
          .eq("status", "pending")
          .eq("is_rolling", false)
          .lt("respond_by", nowIso);
        if (fetchErr) {
          return new Response(JSON.stringify({ error: fetchErr.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        if (!overdue || overdue.length === 0) {
          return Response.json({ ok: true, escalated: 0, rolled });
        }

        // Update statuses in one batch
        const ids = overdue.map((a) => a.id);
        const { error: updErr } = await admin
          .from("activities")
          .update({ status: "auto_declined", updated_at: nowIso })
          .in("id", ids);
        if (updErr) {
          return new Response(JSON.stringify({ error: updErr.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        // Audit log entries
        const auditRows = overdue.map((a) => ({
          activity_id: a.id,
          actor_id: null,
          action: "auto_declined" as const,
          previous_status: "pending",
          new_status: "auto_declined",
          note: "Automatisch geweigerd: bevestigingstermijn verlopen",
        }));
        await admin.from("activity_audit_log").insert(auditRows);

        // Notify all management + admins
        const { data: staff } = await admin
          .from("user_roles")
          .select("user_id, role")
          .in("role", ["admin", "management"]);
        const staffIds = Array.from(new Set((staff ?? []).map((r) => r.user_id)));

        if (staffIds.length > 0) {
          const notifs: {
            user_id: string;
            activity_id: string;
            type: string;
            title: string;
            body: string;
          }[] = [];
          for (const a of overdue) {
            for (const uid of staffIds) {
              notifs.push({
                user_id: uid,
                activity_id: a.id,
                type: "activity_auto_declined",
                title: "Activiteit automatisch geweigerd",
                body: `${a.title} — bevestigingstermijn verlopen`,
              });
            }
          }
          if (notifs.length > 0) {
            const { data: inserted } = await admin
              .from("notifications")
              .insert(notifs)
              .select("id");
            if (inserted && inserted.length > 0) {
              const deliveries = inserted.map((n) => ({
                notification_id: n.id,
                channel: "inapp" as const,
                status: "sent" as const,
                sent_at: nowIso,
              }));
              await admin.from("notification_deliveries").insert(deliveries);
            }
          }
        }

        return Response.json({ ok: true, escalated: overdue.length });
      },
    },
  },
});

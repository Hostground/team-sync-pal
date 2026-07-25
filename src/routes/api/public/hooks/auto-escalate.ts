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
        const providedKey =
          request.headers.get("apikey") ||
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!providedKey || !expected || providedKey !== expected) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }

        const url = process.env.SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const admin = createClient(url, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const nowIso = new Date().toISOString();
        const { data: overdue, error: fetchErr } = await admin
          .from("activities")
          .select("id, title, assignee_id, respond_by, status")
          .eq("status", "pending")
          .lt("respond_by", nowIso);
        if (fetchErr) {
          return new Response(JSON.stringify({ error: fetchErr.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        if (!overdue || overdue.length === 0) {
          return Response.json({ ok: true, escalated: 0 });
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

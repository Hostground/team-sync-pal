import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const CreateActivitySchema = z.object({
  title: z.string().trim().min(1).max(200),
  type_id: z.string().uuid().nullable().optional(),
  assignee_id: z.string().uuid(),
  start_at: z.string(),
  end_at: z.string(),
  location: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  respond_by: z.string().optional(),
  response_window_hours: z.number().min(1).max(720).optional(),
  is_rolling: z.boolean().optional(),
});

async function assertStaff(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("admin") && !roles.includes("management")) {
    throw new Error("Forbidden: staff role required");
  }
}

export const createActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => CreateActivitySchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);

    // Determine respond_by
    let respondBy = data.respond_by;
    if (!respondBy) {
      const { data: setting } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "default_response_window_hours")
        .maybeSingle();
      const hours = data.response_window_hours ?? Number(setting?.value ?? 24);
      respondBy = new Date(Date.now() + hours * 3600_000).toISOString();
    }

    const { data: activity, error } = await supabase
      .from("activities")
      .insert({
        title: data.title,
        type_id: data.type_id ?? null,
        assignee_id: data.assignee_id,
        created_by: userId,
        start_at: data.start_at,
        end_at: data.end_at,
        location: data.location ?? null,
        description: data.description ?? null,
        respond_by: respondBy,
        is_rolling: data.is_rolling ?? false,
        original_start_at: data.start_at,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Create notification for assignee via admin (bypasses RLS on inserts)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: assigneeProfile } = await supabaseAdmin
      .from("profiles")
      .select("notif_email,notif_push,notif_inapp,full_name,email")
      .eq("id", data.assignee_id)
      .maybeSingle();

    const { data: notif } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: data.assignee_id,
        activity_id: activity.id,
        type: "activity_assigned",
        title: "Nieuwe activiteit toegewezen",
        body: `${data.title} — reageer voor ${new Date(respondBy).toLocaleString("nl-BE")}`,
      })
      .select()
      .single();

    if (notif) {
      const deliveries: {
        notification_id: string;
        channel: "email" | "push" | "inapp";
        status: "queued" | "sent";
        sent_at: string | null;
      }[] = [];
      if (assigneeProfile?.notif_inapp !== false) {
        deliveries.push({
          notification_id: notif.id,
          channel: "inapp",
          status: "sent",
          sent_at: new Date().toISOString(),
        });
      }
      if (assigneeProfile?.notif_email !== false) {
        deliveries.push({
          notification_id: notif.id,
          channel: "email",
          status: "queued",
          sent_at: null,
        });
      }
      if (assigneeProfile?.notif_push !== false) {
        deliveries.push({
          notification_id: notif.id,
          channel: "push",
          status: "queued",
          sent_at: null,
        });
      }
      if (deliveries.length) {
        await supabaseAdmin.from("notification_deliveries").insert(deliveries);
      }
    }

    return { id: activity.id };
  });

const RespondSchema = z.object({
  activity_id: z.string().uuid(),
  action: z.enum(["confirm", "decline"]),
  note: z.string().max(500).optional(),
});

export const respondActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => RespondSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Read previous status for audit trail
    const { data: prev } = await supabase
      .from("activities")
      .select("status")
      .eq("id", data.activity_id)
      .eq("assignee_id", userId)
      .maybeSingle();
    const previousStatus = prev?.status ?? null;

    const newStatus = data.action === "confirm" ? "confirmed" : "declined";
    const { data: activity, error } = await supabase
      .from("activities")
      .update({
        status: newStatus,
        responded_at: new Date().toISOString(),
        response_note: data.note ?? null,
      })
      .eq("id", data.activity_id)
      .eq("assignee_id", userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (!activity) throw new Error("Activiteit niet gevonden");

    // Notify creator + write audit log via admin
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      await supabaseAdmin.from("activity_audit_log").insert({
        activity_id: activity.id,
        actor_id: userId,
        action: newStatus,
        note: data.note ?? null,
        previous_status: previousStatus,
        new_status: newStatus,
      });
    } catch (e) {
      console.error("audit log insert failed", e);
    }

    const label = data.action === "confirm" ? "bevestigd" : "geweigerd";
    const { data: notif } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: activity.created_by,
        activity_id: activity.id,
        type: `activity_${data.action}ed`,
        title: `Activiteit ${label}`,
        body: `${activity.title} werd ${label}${data.note ? ` — ${data.note}` : ""}.`,
      })
      .select()
      .single();
    if (notif) {
      await supabaseAdmin.from("notification_deliveries").insert([
        { notification_id: notif.id, channel: "inapp", status: "sent", sent_at: new Date().toISOString() },
        { notification_id: notif.id, channel: "email", status: "queued" },
      ]);
    }

    return { ok: true };
  });


export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ notification_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Verify ownership then update deliveries (inapp) read_at
    const { data: notif } = await supabase
      .from("notifications")
      .select("id,user_id")
      .eq("id", data.notification_id)
      .maybeSingle();
    if (!notif || notif.user_id !== userId) throw new Error("Not allowed");
    await supabase
      .from("notification_deliveries")
      .update({ read_at: new Date().toISOString(), status: "read" })
      .eq("notification_id", data.notification_id)
      .eq("channel", "inapp")
      .is("read_at", null);
    return { ok: true };
  });

const InviteUserSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(1).max(120),
  role: z.enum(["admin", "management", "employee"]),
  password: z.string().min(8).max(128),
});

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InviteUserSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Alleen beheerders");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (error) throw new Error(error.message);
    const newUserId = created.user!.id;

    // trigger created profile + default 'employee' role; adjust role if needed
    if (data.role !== "employee") {
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", newUserId);
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: newUserId, role: data.role });
    }
    return { id: newUserId };
  });

const UpdateRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["admin", "management", "employee"]),
});

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => UpdateRoleSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Alleen beheerders");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id);
    await supabaseAdmin.from("user_roles").insert({ user_id: data.user_id, role: data.role });
    return { ok: true };
  });

const OverviewFiltersSchema = z.object({
  status: z.enum(["pending", "confirmed", "declined", "auto_declined", "cancelled"]).optional(),
  assignee_id: z.string().uuid().optional(),
  type_id: z.string().uuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  only_unread: z.boolean().optional(),
});

export const getActivityOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => OverviewFiltersSchema.parse(data ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);

    let q = supabase
      .from("activities")
      .select(
        "*, activity_types(name,color), notifications(id,type,created_at,notification_deliveries(channel,status,sent_at,read_at)), activity_audit_log(id,action,note,actor_id,created_at,previous_status,new_status)"
      )
      .order("start_at", { ascending: false })
      .limit(500);

    if (data.status) q = q.eq("status", data.status);
    if (data.assignee_id) q = q.eq("assignee_id", data.assignee_id);
    if (data.type_id) q = q.eq("type_id", data.type_id);
    if (data.from) q = q.gte("start_at", data.from);
    if (data.to) q = q.lte("start_at", data.to);

    const { data: acts, error } = await q;
    if (error) throw new Error(error.message);

    const userIds = new Set<string>();
    (acts ?? []).forEach((a: any) => {
      userIds.add(a.assignee_id);
      userIds.add(a.created_by);
      (a.activity_audit_log ?? []).forEach((r: any) => r.actor_id && userIds.add(r.actor_id));
    });
    const { data: profs } = userIds.size
      ? await supabase.from("profiles").select("id,full_name,email").in("id", Array.from(userIds))
      : { data: [] as any[] };
    const pmap = new Map((profs ?? []).map((p: any) => [p.id, p]));

    let results = (acts ?? []).map((a: any) => ({
      ...a,
      assignee: pmap.get(a.assignee_id) ?? null,
      creator: pmap.get(a.created_by) ?? null,
      activity_audit_log: (a.activity_audit_log ?? []).map((r: any) => ({
        ...r,
        actor: r.actor_id ? pmap.get(r.actor_id) ?? null : null,
      })),
    }));

    if (data.only_unread) {
      results = results.filter((a: any) =>
        (a.notifications ?? []).some((n: any) =>
          (n.notification_deliveries ?? []).some((d: any) => d.channel === "inapp" && !d.read_at),
        ),
      );
    }

    return results;
  });

export const getActivityAuditLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ activity_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("activity_audit_log")
      .select("*")
      .eq("activity_id", data.activity_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((rows ?? []).map((r: any) => r.actor_id).filter(Boolean)));
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("id,full_name,email").in("id", ids)
      : { data: [] as any[] };
    const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
    return (rows ?? []).map((r: any) => ({ ...r, actor: r.actor_id ? map.get(r.actor_id) ?? null : null }));
  });

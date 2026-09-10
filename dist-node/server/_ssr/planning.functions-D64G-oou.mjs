import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BBZdFWpw.mjs";
import { a as stringType, i as objectType, n as enumType, r as numberType, t as booleanType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/planning.functions-D64G-oou.js
var CreateActivitySchema = objectType({
	title: stringType().trim().min(1).max(200),
	type_id: stringType().uuid().nullable().optional(),
	assignee_id: stringType().uuid(),
	start_at: stringType(),
	end_at: stringType(),
	location: stringType().max(200).optional().nullable(),
	lat: numberType().min(-90).max(90).optional().nullable(),
	lng: numberType().min(-180).max(180).optional().nullable(),
	description: stringType().max(2e3).optional().nullable(),
	respond_by: stringType().optional(),
	response_window_hours: numberType().min(1).max(720).optional(),
	is_rolling: booleanType().optional()
});
async function assertStaff(supabase, userId) {
	const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
	const roles = (data ?? []).map((r) => r.role);
	if (!roles.includes("admin") && !roles.includes("management")) throw new Error("Forbidden: staff role required");
}
var createActivity_createServerFn_handler = createServerRpc({
	id: "aac4d5e1921009ac4c646d43b1426f1d83e7581e42acbe08ae77ed71491c7db1",
	name: "createActivity",
	filename: "src/lib/planning.functions.ts"
}, (opts) => createActivity.__executeServer(opts));
var createActivity = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => CreateActivitySchema.parse(data)).handler(createActivity_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	await assertStaff(supabase, userId);
	let respondBy = data.respond_by;
	if (!respondBy) {
		const { data: setting } = await supabase.from("settings").select("value").eq("key", "default_response_window_hours").maybeSingle();
		const hours = data.response_window_hours ?? Number(setting?.value ?? 24);
		respondBy = new Date(Date.now() + hours * 36e5).toISOString();
	}
	const { data: activity, error } = await supabase.from("activities").insert({
		title: data.title,
		type_id: data.type_id ?? null,
		assignee_id: data.assignee_id,
		created_by: userId,
		start_at: data.start_at,
		end_at: data.end_at,
		location: data.location ?? null,
		lat: data.lat ?? null,
		lng: data.lng ?? null,
		description: data.description ?? null,
		respond_by: respondBy,
		is_rolling: data.is_rolling ?? false,
		original_start_at: data.start_at
	}).select().single();
	if (error) throw new Error(error.message);
	const { supabaseAdmin } = await import("./client.server-Bw6iWMJ-.mjs");
	const { data: assigneeProfile } = await supabaseAdmin.from("profiles").select("notif_email,notif_push,notif_inapp,full_name,email").eq("id", data.assignee_id).maybeSingle();
	const { data: notif } = await supabaseAdmin.from("notifications").insert({
		user_id: data.assignee_id,
		activity_id: activity.id,
		type: "activity_assigned",
		title: "Nieuwe activiteit toegewezen",
		body: `${data.title} — reageer voor ${new Date(respondBy).toLocaleString("nl-BE")}`
	}).select().single();
	if (notif) {
		const deliveries = [];
		if (assigneeProfile?.notif_inapp !== false) deliveries.push({
			notification_id: notif.id,
			channel: "inapp",
			status: "sent",
			sent_at: (/* @__PURE__ */ new Date()).toISOString()
		});
		if (assigneeProfile?.notif_email !== false) deliveries.push({
			notification_id: notif.id,
			channel: "email",
			status: "queued",
			sent_at: null
		});
		if (assigneeProfile?.notif_push !== false) deliveries.push({
			notification_id: notif.id,
			channel: "push",
			status: "queued",
			sent_at: null
		});
		if (deliveries.length) await supabaseAdmin.from("notification_deliveries").insert(deliveries);
	}
	return { id: activity.id };
});
var RespondSchema = objectType({
	activity_id: stringType().uuid(),
	action: enumType(["confirm", "decline"]),
	note: stringType().max(500).optional()
});
var respondActivity_createServerFn_handler = createServerRpc({
	id: "c2058d95d092ebde5e39f45a68c13e093dd73b3db2cbf898923aad9db341e426",
	name: "respondActivity",
	filename: "src/lib/planning.functions.ts"
}, (opts) => respondActivity.__executeServer(opts));
var respondActivity = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => RespondSchema.parse(data)).handler(respondActivity_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: prev } = await supabase.from("activities").select("status").eq("id", data.activity_id).eq("assignee_id", userId).maybeSingle();
	const previousStatus = prev?.status ?? null;
	const newStatus = data.action === "confirm" ? "confirmed" : "declined";
	const { data: activity, error } = await supabase.from("activities").update({
		status: newStatus,
		responded_at: (/* @__PURE__ */ new Date()).toISOString(),
		response_note: data.note ?? null
	}).eq("id", data.activity_id).eq("assignee_id", userId).select().single();
	if (error) throw new Error(error.message);
	if (!activity) throw new Error("Activiteit niet gevonden");
	const { supabaseAdmin } = await import("./client.server-Bw6iWMJ-.mjs");
	try {
		await supabaseAdmin.from("activity_audit_log").insert({
			activity_id: activity.id,
			actor_id: userId,
			action: newStatus,
			note: data.note ?? null,
			previous_status: previousStatus,
			new_status: newStatus
		});
	} catch (e) {
		console.error("audit log insert failed", e);
	}
	const label = data.action === "confirm" ? "bevestigd" : "geweigerd";
	const { data: notif } = await supabaseAdmin.from("notifications").insert({
		user_id: activity.created_by,
		activity_id: activity.id,
		type: `activity_${data.action}ed`,
		title: `Activiteit ${label}`,
		body: `${activity.title} werd ${label}${data.note ? ` — ${data.note}` : ""}.`
	}).select().single();
	if (notif) await supabaseAdmin.from("notification_deliveries").insert([{
		notification_id: notif.id,
		channel: "inapp",
		status: "sent",
		sent_at: (/* @__PURE__ */ new Date()).toISOString()
	}, {
		notification_id: notif.id,
		channel: "email",
		status: "queued"
	}]);
	return { ok: true };
});
var CompleteSchema = objectType({
	activity_id: stringType().uuid(),
	note: stringType().max(500).optional(),
	auto: booleanType().optional()
});
/** Mark an activity as completed (assignee or staff). Stops rolling activities from moving on. */
var completeActivity_createServerFn_handler = createServerRpc({
	id: "9b48145969970738413bd88ce1ea4e0bf97593f6e78997f8b12e29d04125a7f6",
	name: "completeActivity",
	filename: "src/lib/planning.functions.ts"
}, (opts) => completeActivity.__executeServer(opts));
var completeActivity = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => CompleteSchema.parse(data)).handler(completeActivity_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: act } = await supabase.from("activities").select("id,status,assignee_id").eq("id", data.activity_id).maybeSingle();
	if (!act) throw new Error("Activiteit niet gevonden");
	if (act.status === "completed") return {
		ok: true,
		already: true
	};
	if (act.assignee_id !== userId) await assertStaff(supabase, userId);
	const nowIso = (/* @__PURE__ */ new Date()).toISOString();
	const { error } = await supabase.from("activities").update({
		status: "completed",
		completed_at: nowIso,
		completed_by: userId
	}).eq("id", data.activity_id);
	if (error) throw new Error(error.message);
	const { supabaseAdmin } = await import("./client.server-Bw6iWMJ-.mjs");
	try {
		await supabaseAdmin.from("activity_audit_log").insert({
			activity_id: data.activity_id,
			actor_id: userId,
			action: "completed",
			note: data.note ?? (data.auto ? "Automatisch afgerond: alle taken afgevinkt" : null),
			previous_status: act.status,
			new_status: "completed"
		});
	} catch (e) {
		console.error("audit log insert failed", e);
	}
	return { ok: true };
});
var markNotificationRead_createServerFn_handler = createServerRpc({
	id: "28a7fbcc068b333fec1855d01ae63a2099e64de3ecd9a11b9b67ae07abc7e7bd",
	name: "markNotificationRead",
	filename: "src/lib/planning.functions.ts"
}, (opts) => markNotificationRead.__executeServer(opts));
var markNotificationRead = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ notification_id: stringType().uuid() }).parse(data)).handler(markNotificationRead_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: notif } = await supabase.from("notifications").select("id,user_id").eq("id", data.notification_id).maybeSingle();
	if (!notif || notif.user_id !== userId) throw new Error("Not allowed");
	await supabase.from("notification_deliveries").update({
		read_at: (/* @__PURE__ */ new Date()).toISOString(),
		status: "read"
	}).eq("notification_id", data.notification_id).eq("channel", "inapp").is("read_at", null);
	return { ok: true };
});
var InviteUserSchema = objectType({
	email: stringType().email(),
	full_name: stringType().min(1).max(120),
	role: enumType([
		"admin",
		"management",
		"employee"
	]),
	password: stringType().min(8).max(128)
});
var adminCreateUser_createServerFn_handler = createServerRpc({
	id: "9b544b945d389952b928474ca53ab24b7d82def9c74a1d48ac98ab6510bb3d28",
	name: "adminCreateUser",
	filename: "src/lib/planning.functions.ts"
}, (opts) => adminCreateUser.__executeServer(opts));
var adminCreateUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => InviteUserSchema.parse(data)).handler(adminCreateUser_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: isAdmin } = await supabase.rpc("has_role", {
		_user_id: userId,
		_role: "admin"
	});
	if (!isAdmin) throw new Error("Alleen beheerders");
	const { supabaseAdmin } = await import("./client.server-Bw6iWMJ-.mjs");
	const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
		email: data.email,
		password: data.password,
		email_confirm: true,
		user_metadata: { full_name: data.full_name }
	});
	if (error) throw new Error(error.message);
	const newUserId = created.user.id;
	if (data.role !== "employee") {
		await supabaseAdmin.from("user_roles").delete().eq("user_id", newUserId);
		await supabaseAdmin.from("user_roles").insert({
			user_id: newUserId,
			role: data.role
		});
	}
	return { id: newUserId };
});
var UpdateRoleSchema = objectType({
	user_id: stringType().uuid(),
	role: enumType([
		"admin",
		"management",
		"employee"
	])
});
var adminSetRole_createServerFn_handler = createServerRpc({
	id: "7a10f1ed045ea88fca9f8b30418e0e30bde7218c84f3fbd738156830fa8e6d94",
	name: "adminSetRole",
	filename: "src/lib/planning.functions.ts"
}, (opts) => adminSetRole.__executeServer(opts));
var adminSetRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => UpdateRoleSchema.parse(data)).handler(adminSetRole_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: isAdmin } = await supabase.rpc("has_role", {
		_user_id: userId,
		_role: "admin"
	});
	if (!isAdmin) throw new Error("Alleen beheerders");
	const { supabaseAdmin } = await import("./client.server-Bw6iWMJ-.mjs");
	await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id);
	await supabaseAdmin.from("user_roles").insert({
		user_id: data.user_id,
		role: data.role
	});
	return { ok: true };
});
var OverviewFiltersSchema = objectType({
	status: enumType([
		"pending",
		"confirmed",
		"declined",
		"auto_declined",
		"cancelled",
		"completed"
	]).optional(),
	assignee_id: stringType().uuid().optional(),
	type_id: stringType().uuid().optional(),
	from: stringType().optional(),
	to: stringType().optional(),
	only_unread: booleanType().optional(),
	only_rolling: booleanType().optional()
});
var getActivityOverview_createServerFn_handler = createServerRpc({
	id: "166516be86d18b97f9b78b2ce5d074ed5646bd45fdcbcc76417838fd4edc2df9",
	name: "getActivityOverview",
	filename: "src/lib/planning.functions.ts"
}, (opts) => getActivityOverview.__executeServer(opts));
var getActivityOverview = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => OverviewFiltersSchema.parse(data ?? {})).handler(getActivityOverview_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	await assertStaff(supabase, userId);
	let q = supabase.from("activities").select("*, activity_types(name,color), notifications(id,type,created_at,notification_deliveries(channel,status,sent_at,read_at)), activity_audit_log(id,action,note,actor_id,created_at,previous_status,new_status)").order("start_at", { ascending: false }).limit(500);
	if (data.status) q = q.eq("status", data.status);
	if (data.only_rolling) q = q.eq("is_rolling", true);
	if (data.assignee_id) q = q.eq("assignee_id", data.assignee_id);
	if (data.type_id) q = q.eq("type_id", data.type_id);
	if (data.from) q = q.gte("start_at", data.from);
	if (data.to) q = q.lte("start_at", data.to);
	const { data: acts, error } = await q;
	if (error) throw new Error(error.message);
	const userIds = /* @__PURE__ */ new Set();
	(acts ?? []).forEach((a) => {
		userIds.add(a.assignee_id);
		userIds.add(a.created_by);
		(a.activity_audit_log ?? []).forEach((r) => r.actor_id && userIds.add(r.actor_id));
	});
	const { data: profs } = userIds.size ? await supabase.from("profiles").select("id,full_name,email").in("id", Array.from(userIds)) : { data: [] };
	const pmap = new Map((profs ?? []).map((p) => [p.id, p]));
	let results = (acts ?? []).map((a) => ({
		...a,
		assignee: pmap.get(a.assignee_id) ?? null,
		creator: pmap.get(a.created_by) ?? null,
		activity_audit_log: (a.activity_audit_log ?? []).map((r) => ({
			...r,
			actor: r.actor_id ? pmap.get(r.actor_id) ?? null : null
		}))
	}));
	if (data.only_unread) results = results.filter((a) => (a.notifications ?? []).some((n) => (n.notification_deliveries ?? []).some((d) => d.channel === "inapp" && !d.read_at)));
	return results;
});
var getActivityAuditLog_createServerFn_handler = createServerRpc({
	id: "d2ea4b24fe91249f2724b848b42c8570ee8f74aa91af6f5f2cc9ccb88c941c57",
	name: "getActivityAuditLog",
	filename: "src/lib/planning.functions.ts"
}, (opts) => getActivityAuditLog.__executeServer(opts));
var getActivityAuditLog = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ activity_id: stringType().uuid() }).parse(data)).handler(getActivityAuditLog_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { data: rows, error } = await supabase.from("activity_audit_log").select("*").eq("activity_id", data.activity_id).order("created_at", { ascending: false });
	if (error) throw new Error(error.message);
	const ids = Array.from(new Set((rows ?? []).map((r) => r.actor_id).filter(Boolean)));
	const { data: profs } = ids.length ? await supabase.from("profiles").select("id,full_name,email").in("id", ids) : { data: [] };
	const map = new Map((profs ?? []).map((p) => [p.id, p]));
	return (rows ?? []).map((r) => ({
		...r,
		actor: r.actor_id ? map.get(r.actor_id) ?? null : null
	}));
});
var setActivityLocation_createServerFn_handler = createServerRpc({
	id: "e104f916f69c76500b6b2dd7da8c623140dfbd556fa787fc8aad014781b01053",
	name: "setActivityLocation",
	filename: "src/lib/planning.functions.ts"
}, (opts) => setActivityLocation.__executeServer(opts));
var setActivityLocation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	activity_id: stringType().uuid(),
	lat: numberType().min(-90).max(90).nullable(),
	lng: numberType().min(-180).max(180).nullable()
}).parse(data)).handler(setActivityLocation_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { error } = await supabase.from("activities").update({
		lat: data.lat,
		lng: data.lng
	}).eq("id", data.activity_id);
	if (error) throw new Error(error.message);
	return { ok: true };
});
//#endregion
export { adminCreateUser_createServerFn_handler, adminSetRole_createServerFn_handler, completeActivity_createServerFn_handler, createActivity_createServerFn_handler, getActivityAuditLog_createServerFn_handler, getActivityOverview_createServerFn_handler, markNotificationRead_createServerFn_handler, respondActivity_createServerFn_handler, setActivityLocation_createServerFn_handler };

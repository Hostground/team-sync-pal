import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BBZdFWpw.mjs";
import { t as createSsrRpc } from "./createSsrRpc-8YnnUnRy.mjs";
import { a as stringType, i as objectType, n as enumType, r as numberType, t as booleanType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/planning.functions-BuySTUZv.js
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
var createActivity = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => CreateActivitySchema.parse(data)).handler(createSsrRpc("aac4d5e1921009ac4c646d43b1426f1d83e7581e42acbe08ae77ed71491c7db1"));
var RespondSchema = objectType({
	activity_id: stringType().uuid(),
	action: enumType(["confirm", "decline"]),
	note: stringType().max(500).optional()
});
var respondActivity = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => RespondSchema.parse(data)).handler(createSsrRpc("c2058d95d092ebde5e39f45a68c13e093dd73b3db2cbf898923aad9db341e426"));
var CompleteSchema = objectType({
	activity_id: stringType().uuid(),
	note: stringType().max(500).optional(),
	auto: booleanType().optional()
});
/** Mark an activity as completed (assignee or staff). Stops rolling activities from moving on. */
var completeActivity = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => CompleteSchema.parse(data)).handler(createSsrRpc("9b48145969970738413bd88ce1ea4e0bf97593f6e78997f8b12e29d04125a7f6"));
var markNotificationRead = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ notification_id: stringType().uuid() }).parse(data)).handler(createSsrRpc("28a7fbcc068b333fec1855d01ae63a2099e64de3ecd9a11b9b67ae07abc7e7bd"));
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
var adminCreateUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => InviteUserSchema.parse(data)).handler(createSsrRpc("9b544b945d389952b928474ca53ab24b7d82def9c74a1d48ac98ab6510bb3d28"));
var UpdateRoleSchema = objectType({
	user_id: stringType().uuid(),
	role: enumType([
		"admin",
		"management",
		"employee"
	])
});
var adminSetRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => UpdateRoleSchema.parse(data)).handler(createSsrRpc("7a10f1ed045ea88fca9f8b30418e0e30bde7218c84f3fbd738156830fa8e6d94"));
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
var getActivityOverview = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => OverviewFiltersSchema.parse(data ?? {})).handler(createSsrRpc("166516be86d18b97f9b78b2ce5d074ed5646bd45fdcbcc76417838fd4edc2df9"));
var getActivityAuditLog = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ activity_id: stringType().uuid() }).parse(data)).handler(createSsrRpc("d2ea4b24fe91249f2724b848b42c8570ee8f74aa91af6f5f2cc9ccb88c941c57"));
/** Locatiepin van een activiteit aanpassen (management/admin of toegewezen medewerker). */
var setActivityLocation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	activity_id: stringType().uuid(),
	lat: numberType().min(-90).max(90).nullable(),
	lng: numberType().min(-180).max(180).nullable()
}).parse(data)).handler(createSsrRpc("e104f916f69c76500b6b2dd7da8c623140dfbd556fa787fc8aad014781b01053"));
//#endregion
export { getActivityAuditLog as a, respondActivity as c, createActivity as i, setActivityLocation as l, adminSetRole as n, getActivityOverview as o, completeActivity as r, markNotificationRead as s, adminCreateUser as t };

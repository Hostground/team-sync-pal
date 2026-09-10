import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BBZdFWpw.mjs";
import { a as stringType, i as objectType, r as numberType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/photos.functions-P-ptPZ1Y.js
var BUCKET = "activity-photos";
async function assertAccess(supabase, activityId) {
	const { data, error } = await supabase.rpc("can_access_activity", { _activity_id: activityId });
	if (error || !data) throw new Error("Geen toegang tot deze activiteit");
}
/** Foto's van een activiteit, met tijdelijke kijk-URL's. */
var listActivityPhotos_createServerFn_handler = createServerRpc({
	id: "be20f9a7c808a8be18233cc4217b7bfb271582fcf74c2bd07a81f1a30236858c",
	name: "listActivityPhotos",
	filename: "src/lib/photos.functions.ts"
}, (opts) => listActivityPhotos.__executeServer(opts));
var listActivityPhotos = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ activity_id: stringType().uuid() }).parse(d)).handler(listActivityPhotos_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	await assertAccess(supabase, data.activity_id);
	const { data: rows, error } = await supabase.from("activity_photos").select("*").eq("activity_id", data.activity_id).order("created_at", { ascending: false });
	if (error) throw new Error(error.message);
	const out = [];
	for (const r of rows ?? []) {
		const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(r.storage_path, 3600);
		out.push({
			...r,
			url: signed?.signedUrl ?? null
		});
	}
	return out;
});
var createPhotoUploadUrl_createServerFn_handler = createServerRpc({
	id: "b7677cd206e3c0391100ea729e605bc3e5ec730eaaa7357d6c47df2aaf4df1c9",
	name: "createPhotoUploadUrl",
	filename: "src/lib/photos.functions.ts"
}, (opts) => createPhotoUploadUrl.__executeServer(opts));
var createPhotoUploadUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	activity_id: stringType().uuid(),
	filename: stringType().min(1).max(120)
}).parse(d)).handler(createPhotoUploadUrl_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	await assertAccess(supabase, data.activity_id);
	const ext = (data.filename.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
	const safeExt = [
		"jpg",
		"jpeg",
		"png",
		"webp",
		"heic",
		"heif",
		"gif"
	].includes(ext) ? ext : "jpg";
	const path = `${data.activity_id}/${crypto.randomUUID()}.${safeExt}`;
	const { data: signed, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
	if (error) throw new Error(error.message);
	return {
		path,
		token: signed.token,
		signedUrl: signed.signedUrl
	};
});
var registerActivityPhoto_createServerFn_handler = createServerRpc({
	id: "9bef081177ea575fa2cb4b6bdc094559f290842d5d0862e9e8a68adb12f88082",
	name: "registerActivityPhoto",
	filename: "src/lib/photos.functions.ts"
}, (opts) => registerActivityPhoto.__executeServer(opts));
var registerActivityPhoto = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	activity_id: stringType().uuid(),
	storage_path: stringType().min(1),
	caption: stringType().max(300).nullable().optional(),
	lat: numberType().min(-90).max(90).nullable().optional(),
	lng: numberType().min(-180).max(180).nullable().optional(),
	taken_at: stringType().nullable().optional()
}).parse(d)).handler(registerActivityPhoto_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	await assertAccess(supabase, data.activity_id);
	if (!data.storage_path.startsWith(`${data.activity_id}/`)) throw new Error("Ongeldig bestandspad");
	const { data: row, error } = await supabase.from("activity_photos").insert({
		activity_id: data.activity_id,
		storage_path: data.storage_path,
		caption: data.caption ?? null,
		lat: data.lat ?? null,
		lng: data.lng ?? null,
		taken_at: data.taken_at ?? (/* @__PURE__ */ new Date()).toISOString(),
		uploaded_by: userId
	}).select().single();
	if (error) throw new Error(error.message);
	return row;
});
var deleteActivityPhoto_createServerFn_handler = createServerRpc({
	id: "de88b8ced65b2b060429531ad6b9d53670d3d2d9e07e392ff1fe4b4d591673fd",
	name: "deleteActivityPhoto",
	filename: "src/lib/photos.functions.ts"
}, (opts) => deleteActivityPhoto.__executeServer(opts));
var deleteActivityPhoto = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ photo_id: stringType().uuid() }).parse(d)).handler(deleteActivityPhoto_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { data: photo } = await supabase.from("activity_photos").select("*").eq("id", data.photo_id).maybeSingle();
	if (!photo) throw new Error("Foto niet gevonden");
	const { error } = await supabase.from("activity_photos").delete().eq("id", data.photo_id);
	if (error) throw new Error(error.message);
	await supabase.storage.from(BUCKET).remove([photo.storage_path]);
	return { ok: true };
});
//#endregion
export { createPhotoUploadUrl_createServerFn_handler, deleteActivityPhoto_createServerFn_handler, listActivityPhotos_createServerFn_handler, registerActivityPhoto_createServerFn_handler };

import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { a as stringType, i as objectType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/display.functions-Ci-jZ2XV.js
var CodeSchema = objectType({ code: stringType().regex(/^[A-Za-z0-9_-]{8,64}$/) });
var getDisplayByCode_createServerFn_handler = createServerRpc({
	id: "6a55148ad597e82751c0bfa671caee282e281f6055ae424602d144fb40d769cb",
	name: "getDisplayByCode",
	filename: "src/lib/display.functions.ts"
}, (opts) => getDisplayByCode.__executeServer(opts));
var getDisplayByCode = createServerFn({ method: "GET" }).inputValidator((data) => CodeSchema.parse(data)).handler(getDisplayByCode_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-Bw6iWMJ-.mjs");
	const { data: display } = await supabaseAdmin.from("displays").select("name, timezone, active, template_id").eq("code", data.code).maybeSingle();
	if (!display || !display.active) return null;
	let template = null;
	let slideRows = [];
	if (display.template_id) {
		const { data: t } = await supabaseAdmin.from("display_templates").select("theme, show_clock, clock_position, default_slide_seconds").eq("id", display.template_id).maybeSingle();
		template = t ?? null;
		const { data: s } = await supabaseAdmin.from("display_slides").select("id, kind, title, body, media, seconds").eq("template_id", display.template_id).eq("active", true).order("position", { ascending: true });
		slideRows = s ?? [];
	}
	const allPaths = slideRows.flatMap((s) => Array.isArray(s.media) ? s.media : []);
	const signed = /* @__PURE__ */ new Map();
	if (allPaths.length > 0) {
		const { data: urls } = await supabaseAdmin.storage.from("display-media").createSignedUrls(allPaths, 3600 * 6);
		for (const u of urls ?? []) if (u.path && u.signedUrl) signed.set(u.path, u.signedUrl);
	}
	const defaultSeconds = template?.default_slide_seconds ?? 10;
	const slides = slideRows.map((s) => ({
		id: s.id,
		kind: s.kind ?? "text",
		title: s.title,
		body: s.body,
		seconds: s.seconds && s.seconds > 0 ? s.seconds : defaultSeconds,
		images: (Array.isArray(s.media) ? s.media : []).map((p) => p.startsWith("http") ? p : signed.get(p)).filter((u) => !!u)
	}));
	let today = [];
	if (slides.some((s) => s.kind === "planning_today")) {
		const dayStart = /* @__PURE__ */ new Date(/* @__PURE__ */ new Date());
		dayStart.setHours(0, 0, 0, 0);
		const dayEnd = new Date(dayStart);
		dayEnd.setDate(dayEnd.getDate() + 1);
		const { data: acts } = await supabaseAdmin.from("activities").select("start_at, end_at, title, location, assignee_id, status").gte("start_at", dayStart.toISOString()).lt("start_at", dayEnd.toISOString()).neq("status", "cancelled").order("start_at", { ascending: true });
		const ids = [...new Set((acts ?? []).map((a) => a.assignee_id))];
		const names = /* @__PURE__ */ new Map();
		if (ids.length > 0) {
			const { data: profs } = await supabaseAdmin.from("profiles").select("id, full_name").in("id", ids);
			for (const p of profs ?? []) {
				const first = (p.full_name ?? "").trim().split(/\s+/)[0] ?? "";
				if (first) names.set(p.id, first);
			}
		}
		today = (acts ?? []).map((a) => ({
			start: a.start_at,
			end: a.end_at,
			title: a.title,
			location: a.location,
			person: names.get(a.assignee_id) ?? null
		}));
	}
	return {
		name: display.name,
		timezone: display.timezone,
		show_clock: template?.show_clock ?? true,
		clock_position: template?.clock_position ?? "top-right",
		theme: template?.theme ?? {},
		slides,
		today
	};
});
//#endregion
export { getDisplayByCode_createServerFn_handler };

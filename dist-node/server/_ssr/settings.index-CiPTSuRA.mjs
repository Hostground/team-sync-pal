import { t as supabase } from "./client-aEi6Dc2K.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-CtX3ithx.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useCurrentUser } from "./use-current-user-7eSdy6Gj.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings.index-CiPTSuRA.js
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const { data: me, refetch } = useCurrentUser();
	const qc = useQueryClient();
	const update = async (patch) => {
		if (!me?.user.id) return;
		const { error } = await supabase.from("profiles").update(patch).eq("id", me.user.id);
		if (error) return toast.error(error.message);
		toast.success("Opgeslagen");
		refetch();
		qc.invalidateQueries();
	};
	if (!me?.profile) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: "Instellingen"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Meldingen"
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "In-app meldingen" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: me.profile.notif_inapp,
							onCheckedChange: (v) => update({ notif_inapp: v })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "E-mail meldingen" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: me.profile.notif_email,
							onCheckedChange: (v) => update({ notif_email: v })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Push meldingen" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: me.profile.notif_push,
							onCheckedChange: (v) => update({ notif_push: v })
						})]
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Account"
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "text-sm space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Naam:"
						}),
						" ",
						me.profile.full_name
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "E-mail:"
						}),
						" ",
						me.profile.email
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Rol:"
						}),
						" ",
						me.role
					] })
				]
			})] })
		]
	});
}
//#endregion
export { SettingsPage as component };

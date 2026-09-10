import { t as supabase } from "./client-aEi6Dc2K.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-CtX3ithx.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { T as Clock, d as Plus, g as MapPin, l as Repeat } from "../_libs/lucide-react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUser, t as isStaff } from "./use-current-user-7eSdy6Gj.mjs";
import { a as format, t as nl } from "../_libs/date-fns.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/planning.index-91OZz-v-.js
var import_jsx_runtime = require_jsx_runtime();
var statusMeta = {
	pending: {
		label: "In afwachting",
		variant: "secondary"
	},
	confirmed: {
		label: "Bevestigd",
		variant: "default"
	},
	declined: {
		label: "Geweigerd",
		variant: "destructive"
	},
	auto_declined: {
		label: "Auto-geweigerd",
		variant: "destructive"
	},
	cancelled: {
		label: "Geannuleerd",
		variant: "outline"
	},
	completed: {
		label: "Afgerond",
		variant: "default"
	}
};
function PlanningList() {
	const { data: me } = useCurrentUser();
	const { data: activities = [], isLoading } = useQuery({
		queryKey: ["activities", me?.user.id],
		enabled: !!me?.user.id,
		queryFn: async () => {
			const { data: acts } = await supabase.from("activities").select("*, activity_types(name,color)").order("start_at", { ascending: true });
			const ids = Array.from(new Set((acts ?? []).map((a) => a.assignee_id)));
			const { data: profs } = ids.length ? await supabase.from("profiles").select("id,full_name,email").in("id", ids) : { data: [] };
			const map = new Map((profs ?? []).map((p) => [p.id, p]));
			return (acts ?? []).map((a) => ({
				...a,
				assignee: map.get(a.assignee_id)
			}));
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 max-w-5xl mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: "Planning"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: isStaff(me?.role) ? "Alle activiteiten" : "Jouw toegewezen activiteiten"
			})] }), isStaff(me?.role) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/planning/new",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }), " Nieuwe activiteit"]
				})
			})]
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Laden…"
		}) : activities.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "py-10 text-center text-sm text-muted-foreground",
			children: "Nog geen activiteiten."
		}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3",
			children: activities.map((a) => {
				const st = statusMeta[a.status] ?? statusMeta.pending;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/planning/$id",
					params: { id: a.id },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "hover:border-primary transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
										className: "text-base flex items-center gap-2",
										children: [a.activity_types?.color && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "inline-block h-3 w-3 rounded-full shrink-0",
											style: { backgroundColor: a.activity_types.color }
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate",
											children: a.title
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground mt-1",
										children: [
											a.activity_types?.name ?? "Geen type",
											" ·",
											" ",
											a.assignee?.full_name ?? a.assignee?.email ?? "—"
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col items-end gap-1 shrink-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: st.variant,
										children: st.label
									}), a.is_rolling && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										className: "text-[10px]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "h-3 w-3 mr-1" }), " Lopend"]
									})]
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "pt-0 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
										format(new Date(a.start_at), "EEE d MMM HH:mm", { locale: nl }),
										" –",
										" ",
										format(new Date(a.end_at), "HH:mm")
									]
								}),
								a.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }), a.location]
								}),
								a.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: new Date(a.respond_by) < /* @__PURE__ */ new Date() ? "text-destructive font-medium" : "",
									children: [new Date(a.respond_by) < /* @__PURE__ */ new Date() ? "Verlopen — " : "Reageren voor ", format(new Date(a.respond_by), "d MMM HH:mm", { locale: nl })]
								}),
								a.rollover_count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [a.rollover_count, "× doorgeschoven"] })
							]
						})]
					})
				}, a.id);
			})
		})]
	});
}
//#endregion
export { PlanningList as component };

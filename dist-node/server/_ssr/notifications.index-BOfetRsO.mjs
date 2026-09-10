import { t as supabase } from "./client-aEi6Dc2K.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as CardContent, t as Card } from "./card-CtX3ithx.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { L as Bell, N as Check } from "../_libs/lucide-react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { s as markNotificationRead } from "./planning.functions-BuySTUZv.mjs";
import { n as useCurrentUser } from "./use-current-user-7eSdy6Gj.mjs";
import { i as formatDistanceToNow, t as nl } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications.index-BOfetRsO.js
var import_jsx_runtime = require_jsx_runtime();
function NotificationsPage() {
	const { data: me } = useCurrentUser();
	const qc = useQueryClient();
	const markRead = useServerFn(markNotificationRead);
	const { data: notifs = [] } = useQuery({
		queryKey: ["notifications", me?.user.id],
		enabled: !!me?.user.id,
		queryFn: async () => {
			const { data } = await supabase.from("notifications").select("*, notification_deliveries(channel,status,read_at,sent_at), activities(id,title)").eq("user_id", me.user.id).order("created_at", { ascending: false }).limit(100);
			return data ?? [];
		}
	});
	const handleRead = async (id) => {
		await markRead({ data: { notification_id: id } });
		qc.invalidateQueries({ queryKey: ["notifications"] });
		qc.invalidateQueries({ queryKey: ["unread-notifications"] });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "text-2xl font-bold flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-6 w-6" }), " Meldingen"]
			}),
			notifs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "py-8 text-center text-sm text-muted-foreground",
				children: "Geen meldingen."
			}) }),
			notifs.map((n) => {
				const inapp = n.notification_deliveries.find((d) => d.channel === "inapp");
				const unread = inapp && !inapp.read_at;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: unread ? "border-primary" : "",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "py-3 flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-sm",
									children: n.title
								}),
								n.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: n.body
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-1",
									children: formatDistanceToNow(new Date(n.created_at), {
										addSuffix: true,
										locale: nl
									})
								}),
								n.activity_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/planning/$id",
									params: { id: n.activity_id },
									className: "text-xs text-primary underline mt-1 inline-block",
									children: "Bekijk activiteit"
								})
							]
						}), unread && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => handleRead(n.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
						})]
					})
				}, n.id);
			})
		]
	});
}
//#endregion
export { NotificationsPage as component };

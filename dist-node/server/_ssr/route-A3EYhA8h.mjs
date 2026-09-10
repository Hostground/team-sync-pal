import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-aEi6Dc2K.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { E as ClipboardList, F as CalendarDays, L as Bell, _ as LogOut, a as Tags, b as FileText, h as Menu, m as Monitor, n as Users, o as ShieldCheck, s as Settings, t as X, v as ListChecks } from "../_libs/lucide-react.mjs";
import { _ as useNavigate, f as Outlet, g as Link, l as useLocation } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUser, t as isStaff } from "./use-current-user-7eSdy6Gj.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-A3EYhA8h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var roleLabels = {
	admin: "Beheerder",
	management: "Management",
	employee: "Medewerker"
};
function AppShell({ children }) {
	const navigate = useNavigate();
	const location = useLocation();
	const { data: me } = useCurrentUser();
	const qc = useQueryClient();
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	const { data: unread = 0 } = useQuery({
		queryKey: ["unread-notifications", me?.user.id],
		enabled: !!me?.user.id,
		queryFn: async () => {
			const { data } = await supabase.from("notifications").select("id, notification_deliveries!inner(read_at, channel)").eq("user_id", me.user.id).eq("notification_deliveries.channel", "inapp").is("notification_deliveries.read_at", null);
			return data?.length ?? 0;
		},
		refetchInterval: 3e4
	});
	(0, import_react.useEffect)(() => {
		if (!me?.user.id) return;
		const ch = supabase.channel(`notif-${me.user.id}`).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "notifications",
			filter: `user_id=eq.${me.user.id}`
		}, () => qc.invalidateQueries({ queryKey: ["unread-notifications"] })).subscribe();
		return () => {
			supabase.removeChannel(ch);
		};
	}, [me?.user.id, qc]);
	const handleLogout = async () => {
		await supabase.auth.signOut();
		qc.clear();
		navigate({ to: "/auth" });
	};
	const nav = [
		{
			to: "/planning",
			label: "Planning",
			icon: CalendarDays,
			show: true
		},
		{
			to: "/taken",
			label: "Taken",
			icon: ListChecks,
			show: true
		},
		{
			to: "/overzicht",
			label: "Overzicht",
			icon: ClipboardList,
			show: isStaff(me?.role)
		},
		{
			to: "/notifications",
			label: "Meldingen",
			icon: Bell,
			show: true,
			badge: unread
		},
		{
			to: "/display",
			label: "Infoscherm",
			icon: Monitor,
			show: isStaff(me?.role)
		},
		{
			to: "/templates",
			label: "Sjablonen",
			icon: FileText,
			show: isStaff(me?.role)
		},
		{
			to: "/admin/users",
			label: "Gebruikers",
			icon: Users,
			show: me?.role === "admin"
		},
		{
			to: "/admin/types",
			label: "Activiteitstypes",
			icon: Tags,
			show: me?.role === "admin"
		},
		{
			to: "/settings",
			label: "Instellingen",
			icon: Settings,
			show: true
		}
	];
	const closeMobile = () => setMobileOpen(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-muted/20",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-30 border-b bg-background",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-14 items-center gap-3 px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "md:hidden",
						onClick: () => setMobileOpen((v) => !v),
						"aria-label": "Menu",
						children: mobileOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/planning",
						className: "flex items-center gap-2 font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Planning" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hidden sm:flex flex-col items-end text-xs leading-tight",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: me?.profile?.full_name ?? me?.user.email
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: me ? roleLabels[me.role] : ""
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: handleLogout,
							"aria-label": "Uitloggen",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" })
						})]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: cn("fixed inset-y-14 left-0 z-20 w-60 border-r bg-background transition-transform md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-col gap-1 p-3",
						children: nav.filter((n) => n.show).map(({ to, label, icon: Icon, badge }) => {
							const active = location.pathname.startsWith(to);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to,
								onClick: closeMobile,
								className: cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors", active ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex-1",
										children: label
									}),
									badge && badge > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: active ? "secondary" : "default",
										className: "ml-auto",
										children: badge
									}) : null
								]
							}, to);
						})
					})
				}),
				mobileOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "fixed inset-0 z-10 bg-black/30 md:hidden",
					onClick: closeMobile,
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 min-w-0 p-4 md:p-6",
					children
				})
			]
		})]
	});
}
function LayoutComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
//#endregion
export { LayoutComponent as component };

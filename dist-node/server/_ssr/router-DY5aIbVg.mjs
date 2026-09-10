import { r as __toESM } from "../_runtime.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as supabase } from "./client-aEi6Dc2K.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { M as redirect, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$15 } from "./display._code-C6NlX5l7.mjs";
import { t as Route$16 } from "./planning._id-Bz-R6Tku.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DY5aIbVg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-RqDvpcz4.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	window.__lovableReportRuntimeError?.({
		message,
		stack: error instanceof Error ? error.stack : void 0,
		filename: window.location.pathname
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Pagina niet gevonden"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Deze pagina bestaat niet of is verplaatst."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Naar startpagina"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "Er ging iets mis"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Probeer opnieuw of ga terug naar de startpagina."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Opnieuw proberen"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Naar start"
					})]
				})
			]
		})
	});
}
var Route$14 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Planning — team activiteiten plannen en bevestigen" },
			{
				name: "description",
				content: "Plan activiteiten, wijs medewerkers toe en volg bevestigingen — met meldingen via e-mail, push en in-app."
			},
			{
				property: "og:title",
				content: "Planning — team activiteiten plannen en bevestigen"
			},
			{
				property: "og:description",
				content: "Plan activiteiten, wijs medewerkers toe en volg bevestigingen — met meldingen via e-mail, push en in-app."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary"
			},
			{
				name: "twitter:title",
				content: "Planning — team activiteiten plannen en bevestigen"
			},
			{
				name: "twitter:description",
				content: "Plan activiteiten, wijs medewerkers toe en volg bevestigingen — met meldingen via e-mail, push en in-app."
			},
			{
				property: "og:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eed56457-9eae-4c1a-913a-72be9274bcb8/id-preview-d424aae8--32e63974-1ae1-4dd1-9623-8fd203af5668.lovable.app-1784912171885.png"
			},
			{
				name: "twitter:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eed56457-9eae-4c1a-913a-72be9274bcb8/id-preview-d424aae8--32e63974-1ae1-4dd1-9623-8fd203af5668.lovable.app-1784912171885.png"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}, {
			rel: "icon",
			href: "/favicon.ico",
			type: "image/x-icon"
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "nl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$14.useRouteContext();
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		const { data } = supabase.auth.onAuthStateChange((event) => {
			if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
			router.invalidate();
			if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
		});
		return () => data.subscription.unsubscribe();
	}, [router, queryClient]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			richColors: true,
			position: "top-right"
		})]
	});
}
var $$splitComponentImporter$11 = () => import("./auth-yju0g3W2.mjs");
var Route$13 = createFileRoute("/auth")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./route-A3EYhA8h.mjs");
var Route$12 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var Route$11 = createFileRoute("/")({ beforeLoad: () => {
	throw redirect({ to: "/planning" });
} });
var $$splitComponentImporter$9 = () => import("./templates.index-Dn6_-6_i.mjs");
var Route$10 = createFileRoute("/_authenticated/templates/")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./taken.index-CpH4-2PM.mjs");
var Route$9 = createFileRoute("/_authenticated/taken/")({
	head: () => ({ meta: [
		{ title: "Mijn taken — Planning" },
		{
			name: "description",
			content: "Persoonlijke live takenlijst: voeg taken toe, vink af en hergebruik sjablonen."
		},
		{
			property: "og:title",
			content: "Mijn taken — Planning"
		},
		{
			property: "og:description",
			content: "Persoonlijke live takenlijst met sjablonen, gemaakt voor mobiel gebruik."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./settings.index-CiPTSuRA.mjs");
var Route$8 = createFileRoute("/_authenticated/settings/")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./planning.index-91OZz-v-.mjs");
var Route$7 = createFileRoute("/_authenticated/planning/")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./overzicht.index-BekZi5-i.mjs");
var Route$6 = createFileRoute("/_authenticated/overzicht/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./notifications.index-BOfetRsO.mjs");
var Route$5 = createFileRoute("/_authenticated/notifications/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./display.index-BiTEp-x3.mjs");
var Route$4 = createFileRoute("/_authenticated/display/")({
	head: () => ({ meta: [
		{ title: "Infoscherm beheren — Planning" },
		{
			name: "description",
			content: "Beheer de lobby-TV: templates, slides, foto's, tekst en klokweergave."
		},
		{
			property: "og:title",
			content: "Infoscherm beheren — Planning"
		},
		{
			property: "og:description",
			content: "Beheer de lobby-TV: templates, slides, foto's, tekst en klokweergave."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./planning.new-BKxZDffT.mjs");
var Route$3 = createFileRoute("/_authenticated/planning/new")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./admin.users-BoanQMWH.mjs");
var Route$2 = createFileRoute("/_authenticated/admin/users")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./admin.types-Dgaz1fNq.mjs");
var Route$1 = createFileRoute("/_authenticated/admin/types")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
/**
* Auto-escalate overdue pending activities.
* Called by pg_cron every 5 minutes.
* Auth: Supabase anon key in `apikey` header (matches pg_cron pattern).
*/
var Route = createFileRoute("/api/public/hooks/auto-escalate")({ server: { handlers: { POST: async ({ request }) => {
	const providedSecret = request.headers.get("x-cron-secret") ?? "";
	const url = process.env.SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	const admin = createClient(url, serviceKey, { auth: {
		autoRefreshToken: false,
		persistSession: false
	} });
	const { data: cfg } = await admin.from("cron_config").select("cron_secret").eq("id", 1).maybeSingle();
	const expected = cfg?.cron_secret ?? "";
	const a = new TextEncoder().encode(providedSecret);
	const b = new TextEncoder().encode(expected);
	let mismatch = a.length ^ b.length;
	for (let i = 0; i < Math.min(a.length, b.length); i++) mismatch |= a[i] ^ b[i];
	if (!expected || mismatch !== 0) return new Response(JSON.stringify({ error: "Unauthorized" }), {
		status: 401,
		headers: { "content-type": "application/json" }
	});
	const nowIso = (/* @__PURE__ */ new Date()).toISOString();
	const DAY_MS = 864e5;
	let rolled = 0;
	const { data: rolling } = await admin.from("activities").select("id, start_at, end_at, respond_by, status, rollover_count").eq("is_rolling", true).in("status", [
		"pending",
		"confirmed",
		"declined",
		"auto_declined"
	]).lt("end_at", nowIso);
	for (const a of rolling ?? []) {
		const start = new Date(a.start_at).getTime();
		const end = new Date(a.end_at).getTime();
		const daysBehind = Math.max(1, Math.ceil((Date.now() - end) / DAY_MS));
		const patch = {
			start_at: new Date(start + daysBehind * DAY_MS).toISOString(),
			end_at: new Date(end + daysBehind * DAY_MS).toISOString(),
			rollover_count: (a.rollover_count ?? 0) + 1,
			updated_at: nowIso
		};
		if (a.status === "pending") patch.respond_by = new Date(new Date(a.respond_by).getTime() + daysBehind * DAY_MS).toISOString();
		const { error: rollErr } = await admin.from("activities").update(patch).eq("id", a.id);
		if (rollErr) {
			console.error("rollover failed", a.id, rollErr.message);
			continue;
		}
		rolled++;
		await admin.from("activity_audit_log").insert({
			activity_id: a.id,
			actor_id: null,
			action: "rolled_over",
			previous_status: a.status,
			new_status: a.status,
			note: `Lopende activiteit doorgeschoven: ${new Date(a.start_at).toLocaleString("nl-BE")} → ${new Date(start + daysBehind * DAY_MS).toLocaleString("nl-BE")}`
		});
	}
	const { data: overdue, error: fetchErr } = await admin.from("activities").select("id, title, assignee_id, respond_by, status").eq("status", "pending").eq("is_rolling", false).lt("respond_by", nowIso);
	if (fetchErr) return new Response(JSON.stringify({ error: fetchErr.message }), {
		status: 500,
		headers: { "content-type": "application/json" }
	});
	if (!overdue || overdue.length === 0) return Response.json({
		ok: true,
		escalated: 0,
		rolled
	});
	const ids = overdue.map((a) => a.id);
	const { error: updErr } = await admin.from("activities").update({
		status: "auto_declined",
		updated_at: nowIso
	}).in("id", ids);
	if (updErr) return new Response(JSON.stringify({ error: updErr.message }), {
		status: 500,
		headers: { "content-type": "application/json" }
	});
	const auditRows = overdue.map((a) => ({
		activity_id: a.id,
		actor_id: null,
		action: "auto_declined",
		previous_status: "pending",
		new_status: "auto_declined",
		note: "Automatisch geweigerd: bevestigingstermijn verlopen"
	}));
	await admin.from("activity_audit_log").insert(auditRows);
	const { data: staff } = await admin.from("user_roles").select("user_id, role").in("role", ["admin", "management"]);
	const staffIds = Array.from(new Set((staff ?? []).map((r) => r.user_id)));
	if (staffIds.length > 0) {
		const notifs = [];
		for (const a of overdue) for (const uid of staffIds) notifs.push({
			user_id: uid,
			activity_id: a.id,
			type: "activity_auto_declined",
			title: "Activiteit automatisch geweigerd",
			body: `${a.title} — bevestigingstermijn verlopen`
		});
		if (notifs.length > 0) {
			const { data: inserted } = await admin.from("notifications").insert(notifs).select("id");
			if (inserted && inserted.length > 0) {
				const deliveries = inserted.map((n) => ({
					notification_id: n.id,
					channel: "inapp",
					status: "sent",
					sent_at: nowIso
				}));
				await admin.from("notification_deliveries").insert(deliveries);
			}
		}
	}
	return Response.json({
		ok: true,
		escalated: overdue.length,
		rolled
	});
} } } });
var AuthRoute = Route$13.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$14
});
var AuthenticatedRouteRoute = Route$12.update({
	id: "/_authenticated",
	getParentRoute: () => Route$14
});
var IndexRoute = Route$11.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$14
});
var DisplayCodeRoute = Route$15.update({
	id: "/display/$code",
	path: "/display/$code",
	getParentRoute: () => Route$14
});
var AuthenticatedTemplatesIndexRoute = Route$10.update({
	id: "/templates/",
	path: "/templates/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTakenIndexRoute = Route$9.update({
	id: "/taken/",
	path: "/taken/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSettingsIndexRoute = Route$8.update({
	id: "/settings/",
	path: "/settings/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedPlanningIndexRoute = Route$7.update({
	id: "/planning/",
	path: "/planning/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedOverzichtIndexRoute = Route$6.update({
	id: "/overzicht/",
	path: "/overzicht/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedNotificationsIndexRoute = Route$5.update({
	id: "/notifications/",
	path: "/notifications/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDisplayIndexRoute = Route$4.update({
	id: "/display/",
	path: "/display/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedPlanningNewRoute = Route$3.update({
	id: "/planning/new",
	path: "/planning/new",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedPlanningIdRoute = Route$16.update({
	id: "/planning/$id",
	path: "/planning/$id",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminUsersRoute = Route$2.update({
	id: "/admin/users",
	path: "/admin/users",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminTypesRoute = Route$1.update({
	id: "/admin/types",
	path: "/admin/types",
	getParentRoute: () => AuthenticatedRouteRoute
});
var ApiPublicHooksAutoEscalateRoute = Route.update({
	id: "/api/public/hooks/auto-escalate",
	path: "/api/public/hooks/auto-escalate",
	getParentRoute: () => Route$14
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAdminTypesRoute,
	AuthenticatedAdminUsersRoute,
	AuthenticatedPlanningIdRoute,
	AuthenticatedPlanningNewRoute,
	AuthenticatedDisplayIndexRoute,
	AuthenticatedNotificationsIndexRoute,
	AuthenticatedOverzichtIndexRoute,
	AuthenticatedPlanningIndexRoute,
	AuthenticatedSettingsIndexRoute,
	AuthenticatedTakenIndexRoute,
	AuthenticatedTemplatesIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute,
	DisplayCodeRoute,
	ApiPublicHooksAutoEscalateRoute
};
var routeTree = Route$14._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };

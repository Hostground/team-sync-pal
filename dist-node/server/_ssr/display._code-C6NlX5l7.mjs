import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/display._code-C6NlX5l7.js
var $$splitComponentImporter = () => import("./display._code-DPeccJXn.mjs");
var Route = createFileRoute("/display/$code")({
	head: () => ({ meta: [
		{ title: "Infoscherm — Lobby" },
		{
			name: "description",
			content: "Infoscherm voor de inkomhal met actuele info, foto's, tijd en datum."
		},
		{
			name: "robots",
			content: "noindex"
		},
		{
			property: "og:title",
			content: "Infoscherm — Lobby"
		},
		{
			property: "og:description",
			content: "Infoscherm voor de inkomhal met actuele info, foto's, tijd en datum."
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
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };

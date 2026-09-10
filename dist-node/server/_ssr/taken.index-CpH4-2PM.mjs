import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as ChecklistPanel } from "./ChecklistPanel-BchV0M8h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/taken.index-CpH4-2PM.js
var import_jsx_runtime = require_jsx_runtime();
function TakenPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-bold",
			children: "Mijn taken"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Jouw persoonlijke takenlijst"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChecklistPanel, {
			personal: true,
			title: "Takenlijst"
		})]
	});
}
//#endregion
export { TakenPage as component };

import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Crosshair, g as MapPin, t as X } from "../_libs/lucide-react.mjs";
import { y as ClientOnly } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/LocationPicker-DCTQg3k1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Standaardlocatie: vaste werkplek (Riemst). */
var DEFAULT_CENTER = {
	lat: 50.7857,
	lng: 5.0233
};
var Placeholder = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: "h-64 w-full rounded-md border bg-muted/40 flex items-center justify-center text-sm text-muted-foreground",
	children: "Kaart laden…"
});
function LocationPicker({ value, onChange }) {
	const [, setFlyTo] = (0, import_react.useState)(null);
	const useMyLocation = () => {
		if (!navigator.geolocation) return toast.error("Locatie niet beschikbaar op dit toestel");
		navigator.geolocation.getCurrentPosition((pos) => {
			const p = {
				lat: pos.coords.latitude,
				lng: pos.coords.longitude
			};
			onChange(p);
			setFlyTo(p);
			toast.success("Pin op je huidige locatie gezet");
		}, () => toast.error("Kon je locatie niet ophalen"), {
			enableHighAccuracy: true,
			timeout: 1e4
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Locatie op de kaart" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Tik op de kaart om een pin te zetten. Je kan de pin ook verslepen."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, { fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Placeholder, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: useMyLocation,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { className: "h-4 w-4 mr-1" }), " Mijn huidige locatie"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: () => {
							onChange(DEFAULT_CENTER);
							setFlyTo(DEFAULT_CENTER);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 mr-1" }), " Vaste werkplek"]
					}),
					value && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						onClick: () => onChange(null),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 mr-1" }), " Pin wissen"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: [
							value.lat.toFixed(5),
							", ",
							value.lng.toFixed(5)
						]
					})] })
				]
			})
		]
	});
}
//#endregion
export { LocationPicker as t };

import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-aEi6Dc2K.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-CtX3ithx.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Trash2 } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.types-Dgaz1fNq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TypesAdmin() {
	const qc = useQueryClient();
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		color: "#3b82f6"
	});
	const { data: types = [] } = useQuery({
		queryKey: ["types-admin"],
		queryFn: async () => (await supabase.from("activity_types").select("*").order("name")).data ?? []
	});
	const submit = async (e) => {
		e.preventDefault();
		const { error } = await supabase.from("activity_types").insert({
			name: form.name,
			color: form.color
		});
		if (error) return toast.error(error.message);
		setForm({
			name: "",
			color: "#3b82f6"
		});
		qc.invalidateQueries({ queryKey: ["types-admin"] });
	};
	const remove = async (id) => {
		if (!confirm("Verwijderen?")) return;
		await supabase.from("activity_types").update({ active: false }).eq("id", id);
		qc.invalidateQueries({ queryKey: ["types-admin"] });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: "Activiteitstypes"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Nieuw type"
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "flex gap-3 items-end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Naam" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: form.name,
							onChange: (e) => setForm({
								...form,
								name: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Kleur" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "color",
						value: form.color,
						onChange: (e) => setForm({
							...form,
							color: e.target.value
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Toevoegen"
					})
				]
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: types.filter((t) => t.active).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "py-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-4 w-4 rounded-full",
							style: { backgroundColor: t.color }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.name })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: () => remove(t.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
					})]
				}) }, t.id))
			})
		]
	});
}
//#endregion
export { TypesAdmin as component };

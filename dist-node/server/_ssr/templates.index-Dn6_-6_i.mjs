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
import { d as Plus, i as Trash2, v as ListChecks } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/templates.index-Dn6_-6_i.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ChecklistTemplatesManager() {
	const qc = useQueryClient();
	const [name, setName] = (0, import_react.useState)("");
	const [tasks, setTasks] = (0, import_react.useState)("");
	const { data: templates = [] } = useQuery({
		queryKey: ["checklist-templates"],
		queryFn: async () => (await supabase.from("checklist_templates").select("id,name,checklist_template_items(id,title,position)").order("name")).data ?? []
	});
	const create = async (e) => {
		e.preventDefault();
		const titles = tasks.split("\n").map((t) => t.trim()).filter(Boolean);
		if (!name.trim() || titles.length === 0) return toast.error("Naam en minstens één taak zijn nodig");
		const { data: u } = await supabase.auth.getUser();
		const { data: tpl, error } = await supabase.from("checklist_templates").insert({
			name: name.trim(),
			created_by: u.user.id
		}).select("id").single();
		if (error || !tpl) return toast.error(error?.message ?? "Aanmaken mislukt");
		const { error: e2 } = await supabase.from("checklist_template_items").insert(titles.map((title, position) => ({
			template_id: tpl.id,
			title,
			position
		})));
		if (e2) return toast.error(e2.message);
		toast.success("Checklist-sjabloon aangemaakt");
		setName("");
		setTasks("");
		qc.invalidateQueries({ queryKey: ["checklist-templates"] });
	};
	const remove = async (id) => {
		if (!confirm("Checklist-sjabloon verwijderen?")) return;
		const { error } = await supabase.from("checklist_templates").delete().eq("id", id);
		if (error) return toast.error(error.message);
		qc.invalidateQueries({ queryKey: ["checklist-templates"] });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "flex items-center gap-2 text-base",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, { className: "h-4 w-4" }), " Nieuw checklist-sjabloon"]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: create,
			className: "grid gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Naam *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (e) => setName(e.target.value)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Taken (één per lijn) *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 5,
					value: tasks,
					onChange: (e) => setTasks(e.target.value),
					placeholder: "Materiaal laden\nWerf opruimen\nFoto's nemen"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Aanmaken"
				}) })
			]
		}) })] }), templates.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: t.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: (t.checklist_template_items ?? []).slice().sort((a, b) => a.position - b.position).map((i) => i.title).join(" · ")
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				onClick: () => remove(t.id),
				"aria-label": "Verwijderen",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
			})]
		}) }, t.id))]
	});
}
function TemplatesPage() {
	const qc = useQueryClient();
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		title: "",
		type_id: "",
		location: "",
		description: "",
		duration_minutes: 60
	});
	const { data: templates = [] } = useQuery({
		queryKey: ["templates"],
		queryFn: async () => (await supabase.from("activity_templates").select("*, activity_types(name)").order("name")).data ?? []
	});
	const { data: types = [] } = useQuery({
		queryKey: ["types"],
		queryFn: async () => (await supabase.from("activity_types").select("*").eq("active", true)).data ?? []
	});
	const create = async (e) => {
		e.preventDefault();
		const { data: u } = await supabase.auth.getUser();
		const { error } = await supabase.from("activity_templates").insert({
			name: form.name,
			title: form.title,
			type_id: form.type_id || null,
			location: form.location || null,
			description: form.description || null,
			duration_minutes: form.duration_minutes,
			created_by: u.user.id
		});
		if (error) return toast.error(error.message);
		toast.success("Sjabloon aangemaakt");
		setForm({
			name: "",
			title: "",
			type_id: "",
			location: "",
			description: "",
			duration_minutes: 60
		});
		qc.invalidateQueries({ queryKey: ["templates"] });
	};
	const remove = async (id) => {
		if (!confirm("Sjabloon verwijderen?")) return;
		await supabase.from("activity_templates").delete().eq("id", id);
		qc.invalidateQueries({ queryKey: ["templates"] });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl mx-auto space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: "Sjablonen"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Nieuw sjabloon"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: create,
				className: "grid gap-3 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Naam *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						required: true,
						value: form.name,
						onChange: (e) => setForm({
							...form,
							name: e.target.value
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Titel activiteit *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						required: true,
						value: form.title,
						onChange: (e) => setForm({
							...form,
							title: e.target.value
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.type_id,
						onValueChange: (v) => setForm({
							...form,
							type_id: v
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Kies…" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: types.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: t.id,
							children: t.name
						}, t.id)) })]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Duur (minuten)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: 15,
						value: form.duration_minutes,
						onChange: (e) => setForm({
							...form,
							duration_minutes: Number(e.target.value)
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "md:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Locatie" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.location,
							onChange: (e) => setForm({
								...form,
								location: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "md:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Omschrijving" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: form.description,
							onChange: (e) => setForm({
								...form,
								description: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "md:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Aanmaken"
						})
					})
				]
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: templates.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "py-3 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: t.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							t.title,
							" · ",
							t.activity_types?.name ?? "Geen type",
							" · ",
							t.duration_minutes,
							" min"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: () => remove(t.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
					})]
				}) }, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "pt-4 text-xl font-bold",
				children: "Checklist-sjablonen"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChecklistTemplatesManager, {})
		]
	});
}
//#endregion
export { TemplatesPage as component };

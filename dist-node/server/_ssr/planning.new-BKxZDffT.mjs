import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-aEi6Dc2K.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-CtX3ithx.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { j as ChevronLeft } from "../_libs/lucide-react.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { i as createActivity } from "./planning.functions-BuySTUZv.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { t as LocationPicker } from "./LocationPicker-DCTQg3k1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/planning.new-BKxZDffT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NewActivity() {
	const navigate = useNavigate();
	const submit = useServerFn(createActivity);
	const { data: types = [] } = useQuery({
		queryKey: ["types"],
		queryFn: async () => (await supabase.from("activity_types").select("*").eq("active", true)).data ?? []
	});
	const { data: employees = [] } = useQuery({
		queryKey: ["all-users"],
		queryFn: async () => (await supabase.from("profiles").select("id,full_name,email").eq("active", true).order("full_name")).data ?? []
	});
	const { data: templates = [] } = useQuery({
		queryKey: ["templates"],
		queryFn: async () => (await supabase.from("activity_templates").select("*").order("name")).data ?? []
	});
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		type_id: "",
		assignee_id: "",
		start_at: "",
		end_at: "",
		location: "",
		description: "",
		response_window_hours: 24,
		is_rolling: false,
		save_as_template: false,
		template_name: ""
	});
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [pin, setPin] = (0, import_react.useState)(null);
	const applyTemplate = (id) => {
		const t = templates.find((x) => x.id === id);
		if (!t) return;
		setForm((f) => ({
			...f,
			title: t.title,
			type_id: t.type_id ?? "",
			location: t.location ?? "",
			description: t.description ?? ""
		}));
		toast.success(`Sjabloon "${t.name}" geladen`);
	};
	const onSubmit = async (e) => {
		e.preventDefault();
		if (!form.assignee_id || !form.start_at || !form.end_at) return toast.error("Vul medewerker en tijden in");
		setLoading(true);
		try {
			await submit({ data: {
				title: form.title,
				type_id: form.type_id || null,
				assignee_id: form.assignee_id,
				start_at: new Date(form.start_at).toISOString(),
				end_at: new Date(form.end_at).toISOString(),
				location: form.location || null,
				lat: pin?.lat ?? null,
				lng: pin?.lng ?? null,
				description: form.description || null,
				response_window_hours: form.response_window_hours,
				is_rolling: form.is_rolling
			} });
			if (form.save_as_template && form.template_name.trim()) {
				const { data: u } = await supabase.auth.getUser();
				await supabase.from("activity_templates").insert({
					name: form.template_name,
					type_id: form.type_id || null,
					title: form.title,
					location: form.location || null,
					description: form.description || null,
					duration_minutes: 60,
					created_by: u.user.id
				});
			}
			toast.success("Activiteit aangemaakt");
			navigate({ to: "/planning" });
		} catch (err) {
			toast.error(err.message ?? "Er ging iets mis");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/planning",
			className: "inline-flex items-center text-sm text-muted-foreground hover:text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" }), " Terug"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Nieuwe activiteit" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit,
			className: "space-y-4",
			children: [
				templates.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Sjabloon (optioneel)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					onValueChange: applyTemplate,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Kies sjabloon…" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: templates.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: t.id,
						children: t.name
					}, t.id)) })]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "title",
					children: "Titel *"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "title",
					required: true,
					value: form.title,
					onChange: (e) => setForm({
						...form,
						title: e.target.value
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.type_id,
						onValueChange: (v) => setForm({
							...form,
							type_id: v
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Kies…" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: types.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: t.id,
							children: t.name
						}, t.id)) })]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Medewerker *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.assignee_id,
						onValueChange: (v) => setForm({
							...form,
							assignee_id: v
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Kies…" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: employees.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: u.id,
							children: u.full_name ?? u.email
						}, u.id)) })]
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "start",
						children: "Start *"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "start",
						type: "datetime-local",
						required: true,
						value: form.start_at,
						onChange: (e) => setForm({
							...form,
							start_at: e.target.value
						})
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "end",
						children: "Eind *"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "end",
						type: "datetime-local",
						required: true,
						value: form.end_at,
						onChange: (e) => setForm({
							...form,
							end_at: e.target.value
						})
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "loc",
					children: "Locatie"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "loc",
					value: form.location,
					onChange: (e) => setForm({
						...form,
						location: e.target.value
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationPicker, {
					value: pin,
					onChange: setPin
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "desc",
					children: "Omschrijving"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "desc",
					value: form.description,
					onChange: (e) => setForm({
						...form,
						description: e.target.value
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "window",
						children: "Bevestigingstermijn (uren)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "window",
						type: "number",
						min: 1,
						max: 720,
						value: form.response_window_hours,
						onChange: (e) => setForm({
							...form,
							response_window_hours: Number(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-1",
						children: "Zonder reactie → automatisch geweigerd."
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t pt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-start gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "mt-1",
							checked: form.is_rolling,
							onChange: (e) => setForm({
								...form,
								is_rolling: e.target.checked
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Lopende activiteit", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs text-muted-foreground",
							children: "Niet afgerond? Dan schuift de activiteit automatisch door naar de volgende dag (zelfde uren) en wordt ze niet automatisch geweigerd."
						})] })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t pt-3 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: form.save_as_template,
							onChange: (e) => setForm({
								...form,
								save_as_template: e.target.checked
							})
						}), "Opslaan als sjabloon voor volgende keer"]
					}), form.save_as_template && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Naam van sjabloon",
						value: form.template_name,
						onChange: (e) => setForm({
							...form,
							template_name: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "w-full",
					disabled: loading,
					children: loading ? "Bezig…" : "Activiteit aanmaken"
				})
			]
		}) })] })]
	});
}
//#endregion
export { NewActivity as component };

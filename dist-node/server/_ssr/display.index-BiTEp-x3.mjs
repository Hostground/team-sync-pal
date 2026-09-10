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
import { R as ArrowUp, d as Plus, i as Trash2, m as Monitor, u as RefreshCw, w as Copy, x as ExternalLink, y as ImagePlus, z as ArrowDown } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { n as useCurrentUser, t as isStaff } from "./use-current-user-7eSdy6Gj.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/display.index-BiTEp-x3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var randomCode = () => {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 24);
};
var slideKinds = [
	{
		value: "text",
		label: "Tekst"
	},
	{
		value: "photos",
		label: "Foto's + tekst"
	},
	{
		value: "planning_today",
		label: "Planning vandaag"
	}
];
function DisplayAdminPage() {
	const { data: me } = useCurrentUser();
	const qc = useQueryClient();
	const [selectedTemplate, setSelectedTemplate] = (0, import_react.useState)("");
	const { data: templates = [] } = useQuery({
		queryKey: ["display-templates"],
		queryFn: async () => (await supabase.from("display_templates").select("*").order("name")).data ?? []
	});
	const { data: displays = [] } = useQuery({
		queryKey: ["displays"],
		queryFn: async () => (await supabase.from("displays").select("*").order("name")).data ?? []
	});
	const activeTemplate = selectedTemplate || templates[0]?.id || "";
	const { data: slides = [] } = useQuery({
		queryKey: ["display-slides", activeTemplate],
		enabled: !!activeTemplate,
		queryFn: async () => (await supabase.from("display_slides").select("*").eq("template_id", activeTemplate).order("position")).data ?? []
	});
	if (!isStaff(me?.role)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted-foreground",
		children: "Geen toegang."
	});
	const refetchAll = () => {
		qc.invalidateQueries({ queryKey: ["display-templates"] });
		qc.invalidateQueries({ queryKey: ["displays"] });
		qc.invalidateQueries({ queryKey: ["display-slides"] });
	};
	const addTemplate = async () => {
		const { error } = await supabase.from("display_templates").insert({
			name: "Nieuw template",
			created_by: me.user.id
		});
		if (error) return toast.error(error.message);
		refetchAll();
	};
	const updateTemplate = async (id, patch) => {
		const { error } = await supabase.from("display_templates").update(patch).eq("id", id);
		if (error) return toast.error(error.message);
		qc.invalidateQueries({ queryKey: ["display-templates"] });
	};
	const deleteTemplate = async (id) => {
		const { error } = await supabase.from("display_templates").delete().eq("id", id);
		if (error) return toast.error(error.message);
		if (activeTemplate === id) setSelectedTemplate("");
		refetchAll();
	};
	const addSlide = async (kind) => {
		if (!activeTemplate) return toast.error("Maak eerst een template aan");
		const { error } = await supabase.from("display_slides").insert({
			template_id: activeTemplate,
			kind,
			position: slides.length,
			title: kind === "planning_today" ? "Vandaag" : "Nieuwe slide"
		});
		if (error) return toast.error(error.message);
		qc.invalidateQueries({ queryKey: ["display-slides", activeTemplate] });
	};
	const updateSlide = async (id, patch) => {
		const { error } = await supabase.from("display_slides").update(patch).eq("id", id);
		if (error) return toast.error(error.message);
		qc.invalidateQueries({ queryKey: ["display-slides", activeTemplate] });
	};
	const deleteSlide = async (id) => {
		const { error } = await supabase.from("display_slides").delete().eq("id", id);
		if (error) return toast.error(error.message);
		qc.invalidateQueries({ queryKey: ["display-slides", activeTemplate] });
	};
	const moveSlide = async (index, dir) => {
		const a = slides[index];
		const b = slides[index + dir];
		if (!a || !b) return;
		await supabase.from("display_slides").update({ position: b.position }).eq("id", a.id);
		await supabase.from("display_slides").update({ position: a.position }).eq("id", b.id);
		qc.invalidateQueries({ queryKey: ["display-slides", activeTemplate] });
	};
	const uploadImages = async (slideId, current, files) => {
		if (!files || files.length === 0) return;
		const paths = [...current];
		for (const file of Array.from(files)) {
			const ext = file.name.split(".").pop() ?? "jpg";
			const path = `${activeTemplate}/${crypto.randomUUID()}.${ext}`;
			const { error } = await supabase.storage.from("display-media").upload(path, file, { cacheControl: "3600" });
			if (error) {
				toast.error(error.message);
				continue;
			}
			paths.push(path);
		}
		await updateSlide(slideId, { media: paths });
		toast.success("Foto's toegevoegd");
	};
	const removeImage = async (slideId, current, path) => {
		await supabase.storage.from("display-media").remove([path]);
		await updateSlide(slideId, { media: current.filter((p) => p !== path) });
	};
	const addDisplay = async () => {
		const { error } = await supabase.from("displays").insert({
			name: "Lobby TV",
			code: randomCode(),
			template_id: activeTemplate || null,
			created_by: me.user.id
		});
		if (error) return toast.error(error.message);
		qc.invalidateQueries({ queryKey: ["displays"] });
	};
	const updateDisplay = async (id, patch) => {
		const { error } = await supabase.from("displays").update(patch).eq("id", id);
		if (error) return toast.error(error.message);
		qc.invalidateQueries({ queryKey: ["displays"] });
	};
	const deleteDisplay = async (id) => {
		const { error } = await supabase.from("displays").delete().eq("id", id);
		if (error) return toast.error(error.message);
		qc.invalidateQueries({ queryKey: ["displays"] });
	};
	const displayUrl = (code) => typeof window === "undefined" ? `/display/${code}` : `${window.location.origin}/display/${code}`;
	const tpl = templates.find((t) => t.id === activeTemplate);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, { className: "h-5 w-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold",
				children: "Infoscherm"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "screens",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "screens",
					children: "Schermen"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "templates",
					children: "Templates & slides"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "screens",
					className: "mt-4 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: addDisplay,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " Nieuw scherm"]
						}),
						displays.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: d.name
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Naam" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										defaultValue: d.name,
										onBlur: (e) => e.target.value !== d.name && updateDisplay(d.id, { name: e.target.value })
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Template" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: d.template_id ?? "",
										onValueChange: (v) => updateDisplay(d.id, { template_id: v || null }),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Kies template" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: templates.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: t.id,
											children: t.name
										}, t.id)) })]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
											className: "max-w-full truncate rounded bg-muted px-2 py-1 text-xs",
											children: displayUrl(d.code)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => {
												navigator.clipboard.writeText(displayUrl(d.code));
												toast.success("Link gekopieerd");
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "mr-2 h-4 w-4" }), " Kopieer link"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											asChild: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
												href: `/display/${d.code}`,
												target: "_blank",
												rel: "noreferrer",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-2 h-4 w-4" }), " Open op TV"]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "outline",
											onClick: () => updateDisplay(d.id, { code: randomCode() }),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 h-4 w-4" }), " Nieuwe code"]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											checked: d.active,
											onCheckedChange: (v) => updateDisplay(d.id, { active: v }),
											id: `act-${d.id}`
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: `act-${d.id}`,
											children: "Actief"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => deleteDisplay(d.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
									})]
								})
							]
						})] }, d.id)),
						displays.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Nog geen schermen aangemaakt."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "templates",
					className: "mt-4 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-end gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-48",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Template" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: activeTemplate,
										onValueChange: setSelectedTemplate,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Kies template" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: templates.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: t.id,
											children: t.name
										}, t.id)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: addTemplate,
									variant: "secondary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " Nieuw template"]
								}),
								tpl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									onClick: () => deleteTemplate(tpl.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 h-4 w-4" }), " Verwijder template"]
								})
							]
						}),
						tpl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: "Instellingen"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Naam" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									defaultValue: tpl.name,
									onBlur: (e) => e.target.value !== tpl.name && updateTemplate(tpl.id, { name: e.target.value })
								}, tpl.id)] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Slideduur (seconden)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 3,
									defaultValue: tpl.default_slide_seconds,
									onBlur: (e) => updateTemplate(tpl.id, { default_slide_seconds: Number(e.target.value) || 10 })
								}, `sec-${tpl.id}`)] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										id: "clock",
										checked: tpl.show_clock,
										onCheckedChange: (v) => updateTemplate(tpl.id, { show_clock: v })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "clock",
										children: "Klok & datum tonen"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Positie klok" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: tpl.clock_position,
									onValueChange: (v) => updateTemplate(tpl.id, { clock_position: v }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "top-left",
											children: "Links boven"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "top-right",
											children: "Rechts boven"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "bottom-left",
											children: "Links onder"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "bottom-right",
											children: "Rechts onder"
										})
									] })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Achtergrondkleur" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "color",
									defaultValue: tpl.theme?.bg ?? "#0b1220",
									onBlur: (e) => updateTemplate(tpl.id, { theme: {
										...tpl.theme,
										bg: e.target.value
									} })
								}, `bg-${tpl.id}`)] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Donkerte over foto (0–1)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									step: "0.05",
									min: 0,
									max: 1,
									defaultValue: tpl.theme?.overlay ?? .35,
									onBlur: (e) => updateTemplate(tpl.id, { theme: {
										...tpl.theme,
										overlay: Number(e.target.value)
									} })
								}, `ov-${tpl.id}`)] })
							]
						})] }),
						tpl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: slideKinds.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => addSlide(k.value),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }),
									" ",
									k.label
								]
							}, k.value))
						}),
						slides.map((s, i) => {
							const media = Array.isArray(s.media) ? s.media : [];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between gap-2 pb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
									className: "text-base",
									children: [
										i + 1,
										". ",
										slideKinds.find((k) => k.value === s.kind)?.label ?? s.kind
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											onClick: () => moveSlide(i, -1),
											disabled: i === 0,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											onClick: () => moveSlide(i, 1),
											disabled: i === slides.length - 1,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											onClick: () => deleteSlide(s.id),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-3 sm:grid-cols-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Titel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											defaultValue: s.title ?? "",
											onBlur: (e) => e.target.value !== s.title && updateSlide(s.id, { title: e.target.value })
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Duur (sec, leeg = standaard)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: 3,
											defaultValue: s.seconds ?? "",
											onBlur: (e) => updateSlide(s.id, { seconds: e.target.value ? Number(e.target.value) : null })
										})] })]
									}),
									s.kind !== "planning_today" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tekst" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 3,
										defaultValue: s.body ?? "",
										onBlur: (e) => e.target.value !== s.body && updateSlide(s.id, { body: e.target.value })
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Achtergrondfoto's" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex flex-wrap items-center gap-2",
										children: [media.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1 rounded border px-2 py-1 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "max-w-40 truncate",
												children: p.split("/").pop()
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "text-destructive",
												onClick: () => removeImage(s.id, media, p),
												"aria-label": "Verwijder foto",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
											})]
										}, p)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-4 w-4" }),
												" Foto's toevoegen",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "file",
													accept: "image/*",
													multiple: true,
													className: "hidden",
													onChange: (e) => uploadImages(s.id, media, e.target.files)
												})
											]
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											id: `sa-${s.id}`,
											checked: s.active,
											onCheckedChange: (v) => updateSlide(s.id, { active: v })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: `sa-${s.id}`,
											children: "Actief"
										})]
									})
								]
							})] }, s.id);
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { DisplayAdminPage as component };

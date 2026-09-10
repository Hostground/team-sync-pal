import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-aEi6Dc2K.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-CtX3ithx.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as ChevronRight, D as Circle, M as ChevronDown, N as Check, S as EllipsisVertical, c as Save, d as Plus, f as Pencil, i as Trash2, v as ListChecks, w as Copy } from "../_libs/lucide-react.mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { n as useCurrentUser, t as isStaff } from "./use-current-user-7eSdy6Gj.mjs";
import { a as DialogHeader, i as DialogFooter, n as Dialog, o as DialogTitle, r as DialogContent, t as Checkbox } from "./dialog-DWXt-hnc.mjs";
import { n as Root, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ChecklistPanel-BchV0M8h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Progress = import_react.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
		className: "h-full w-full flex-1 bg-primary transition-all",
		style: { transform: `translateX(-${100 - (value || 0)}%)` }
	})
}));
Progress.displayName = Root.displayName;
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	checked,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
function ChecklistPanel({ activityId, personal, title = "Taken", onAllDone }) {
	const qc = useQueryClient();
	const { data: me } = useCurrentUser();
	const userId = me?.user.id;
	const staff = isStaff(me?.role);
	const inputRef = (0, import_react.useRef)(null);
	const [newTitle, setNewTitle] = (0, import_react.useState)("");
	const [showDone, setShowDone] = (0, import_react.useState)(false);
	const [templateOpen, setTemplateOpen] = (0, import_react.useState)(false);
	const [copyOpen, setCopyOpen] = (0, import_react.useState)(false);
	const [saveOpen, setSaveOpen] = (0, import_react.useState)(false);
	const [saveName, setSaveName] = (0, import_react.useState)("");
	const scopeKey = activityId ? [
		"checklist",
		"activity",
		activityId
	] : [
		"checklist",
		"personal",
		userId
	];
	const enabled = activityId ? true : !!userId;
	const { data: items = [], isLoading } = useQuery({
		queryKey: scopeKey,
		enabled,
		queryFn: async () => {
			let q = supabase.from("checklist_items").select("*").order("position", { ascending: true });
			q = activityId ? q.eq("activity_id", activityId) : q.eq("owner_id", userId);
			const { data, error } = await q;
			if (error) throw new Error(error.message);
			return data ?? [];
		}
	});
	(0, import_react.useEffect)(() => {
		if (!enabled) return;
		const filter = activityId ? `activity_id=eq.${activityId}` : `owner_id=eq.${userId}`;
		const channel = supabase.channel(`checklist-${activityId ?? userId}`).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "checklist_items",
			filter
		}, () => qc.invalidateQueries({ queryKey: scopeKey })).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [
		activityId,
		userId,
		enabled
	]);
	const nextPosition = () => items.length ? Math.max(...items.map((i) => i.position)) + 1 : 0;
	const addItem = useMutation({
		mutationFn: async (t) => {
			const { error } = await supabase.from("checklist_items").insert({
				title: t,
				activity_id: activityId ?? null,
				owner_id: activityId ? null : userId,
				created_by: userId,
				position: nextPosition()
			});
			if (error) throw new Error(error.message);
		},
		onMutate: async (t) => {
			await qc.cancelQueries({ queryKey: scopeKey });
			const prev = qc.getQueryData(scopeKey) ?? [];
			qc.setQueryData(scopeKey, [...prev, {
				id: `tmp-${Date.now()}`,
				title: t,
				done: false,
				done_at: null,
				done_by: null,
				position: nextPosition(),
				activity_id: activityId ?? null,
				owner_id: activityId ? null : userId ?? null
			}]);
			return { prev };
		},
		onError: (e, _v, ctx) => {
			if (ctx?.prev) qc.setQueryData(scopeKey, ctx.prev);
			toast.error(e.message);
		},
		onSettled: () => qc.invalidateQueries({ queryKey: scopeKey })
	});
	const toggle = useMutation({
		mutationFn: async (item) => {
			const done = !item.done;
			const { error } = await supabase.from("checklist_items").update({
				done,
				done_at: done ? (/* @__PURE__ */ new Date()).toISOString() : null,
				done_by: done ? userId : null
			}).eq("id", item.id);
			if (error) throw new Error(error.message);
			if (done && onAllDone) {
				const all = qc.getQueryData(scopeKey) ?? [];
				const stillOpen = all.filter((i) => i.id !== item.id && !i.done);
				if (all.length > 0 && stillOpen.length === 0) await onAllDone();
			}
		},
		onMutate: async (item) => {
			await qc.cancelQueries({ queryKey: scopeKey });
			const prev = qc.getQueryData(scopeKey) ?? [];
			qc.setQueryData(scopeKey, prev.map((i) => i.id === item.id ? {
				...i,
				done: !i.done
			} : i));
			return { prev };
		},
		onError: (e, _v, ctx) => {
			if (ctx?.prev) qc.setQueryData(scopeKey, ctx.prev);
			toast.error(e.message);
		},
		onSettled: () => qc.invalidateQueries({ queryKey: scopeKey })
	});
	const rename = useMutation({
		mutationFn: async ({ id, title: t }) => {
			const { error } = await supabase.from("checklist_items").update({ title: t }).eq("id", id);
			if (error) throw new Error(error.message);
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: scopeKey }),
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("checklist_items").delete().eq("id", id);
			if (error) throw new Error(error.message);
		},
		onMutate: async (id) => {
			await qc.cancelQueries({ queryKey: scopeKey });
			const prev = qc.getQueryData(scopeKey) ?? [];
			qc.setQueryData(scopeKey, prev.filter((i) => i.id !== id));
			return { prev };
		},
		onError: (e, _v, ctx) => {
			if (ctx?.prev) qc.setQueryData(scopeKey, ctx.prev);
			toast.error(e.message);
		},
		onSettled: () => qc.invalidateQueries({ queryKey: scopeKey })
	});
	const { data: templates = [] } = useQuery({
		queryKey: ["checklist-templates"],
		enabled: templateOpen || saveOpen,
		queryFn: async () => (await supabase.from("checklist_templates").select("id,name,checklist_template_items(id,title,position)").order("name")).data ?? []
	});
	const { data: recentActivities = [] } = useQuery({
		queryKey: ["checklist-copy-sources"],
		enabled: copyOpen,
		queryFn: async () => (await supabase.from("activities").select("id,title,start_at").order("start_at", { ascending: false }).limit(30)).data ?? []
	});
	const insertMany = async (titles) => {
		if (!titles.length) return;
		const base = nextPosition();
		const { error } = await supabase.from("checklist_items").insert(titles.map((t, i) => ({
			title: t,
			activity_id: activityId ?? null,
			owner_id: activityId ? null : userId,
			created_by: userId,
			position: base + i
		})));
		if (error) return toast.error(error.message);
		toast.success(`${titles.length} taken toegevoegd`);
		qc.invalidateQueries({ queryKey: scopeKey });
	};
	const applyTemplate = async (templateId) => {
		const titles = (templates.find((t) => t.id === templateId)?.checklist_template_items ?? []).slice().sort((a, b) => a.position - b.position).map((i) => i.title);
		setTemplateOpen(false);
		await insertMany(titles);
	};
	const copyFromActivity = async (id) => {
		const { data } = await supabase.from("checklist_items").select("title,position").eq("activity_id", id).order("position");
		setCopyOpen(false);
		await insertMany((data ?? []).map((i) => i.title));
	};
	const saveAsTemplate = async () => {
		if (!saveName.trim()) return;
		const { data: tpl, error } = await supabase.from("checklist_templates").insert({
			name: saveName.trim(),
			created_by: userId
		}).select("id").single();
		if (error || !tpl) return toast.error(error?.message ?? "Opslaan mislukt");
		const { error: e2 } = await supabase.from("checklist_template_items").insert(items.map((i, idx) => ({
			template_id: tpl.id,
			title: i.title,
			position: idx
		})));
		if (e2) return toast.error(e2.message);
		toast.success("Bewaard als sjabloon");
		setSaveOpen(false);
		setSaveName("");
		qc.invalidateQueries({ queryKey: ["checklist-templates"] });
	};
	const open = items.filter((i) => !i.done);
	const done = items.filter((i) => i.done);
	const submitNew = (e) => {
		e.preventDefault();
		const t = newTitle.trim();
		if (!t) return;
		addItem.mutate(t);
		setNewTitle("");
		inputRef.current?.focus();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "pb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex min-w-0 items-center gap-2 text-base",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: title
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: [
						done.length,
						"/",
						items.length,
						" afgerond"
					]
				})]
			}), items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: done.length / items.length * 100,
				className: "mt-2 h-1.5"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submitNew,
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						ref: inputRef,
						value: newTitle,
						onChange: (e) => setNewTitle(e.target.value),
						placeholder: "Nieuwe taak…",
						className: "h-11",
						enterKeyHint: "done"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "icon",
						className: "h-11 w-11 shrink-0",
						"aria-label": "Taak toevoegen",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-5 w-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setTemplateOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, { className: "mr-1 h-4 w-4" }), " Sjabloon"]
						}),
						activityId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setCopyOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "mr-1 h-4 w-4" }), " Kopiëren"]
						}),
						staff && items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setSaveOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-1 h-4 w-4" }), " Bewaren"]
						})
					]
				}),
				isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Laden…"
				}) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-4 text-center text-sm text-muted-foreground",
					children: "Nog geen taken."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y",
					children: open.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						item,
						onToggle: () => toggle.mutate(item),
						onRename: rename.mutate,
						onRemove: remove.mutate
					}, item.id))
				}),
				done.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setShowDone((v) => !v),
					className: "flex w-full items-center gap-1 py-2 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("h-4 w-4 transition-transform", showDone && "rotate-180") }),
						"Afgerond (",
						done.length,
						")"
					]
				}), showDone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y",
					children: done.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						item,
						onToggle: () => toggle.mutate(item),
						onRename: rename.mutate,
						onRemove: remove.mutate
					}, item.id))
				})] })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: templateOpen,
			onOpenChange: setTemplateOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Sjabloon toepassen" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [templates.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Nog geen checklist-sjablonen."
				}), templates.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => applyTemplate(t.id),
					className: "w-full rounded-md border p-3 text-left hover:bg-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: t.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-2 text-xs text-muted-foreground",
						children: [t.checklist_template_items?.length ?? 0, " taken"]
					})]
				}, t.id))]
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: copyOpen,
			onOpenChange: setCopyOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-h-[80vh] overflow-y-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Kopiëren van eerdere activiteit" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: recentActivities.filter((a) => a.id !== activityId).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => copyFromActivity(a.id),
						className: "w-full rounded-md border p-3 text-left hover:bg-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate font-medium",
							children: a.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: new Date(a.start_at).toLocaleDateString("nl-BE")
						})]
					}, a.id))
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: saveOpen,
			onOpenChange: setSaveOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Bewaren als sjabloon" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: saveName,
					onChange: (e) => setSaveName(e.target.value),
					placeholder: "Naam van het sjabloon"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: saveAsTemplate,
					children: "Bewaren"
				}) })
			] })
		})
	] });
}
function Row({ item, onToggle, onRename, onRemove }) {
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [value, setValue] = (0, import_react.useState)(item.title);
	if (editing) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center gap-2 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			autoFocus: true,
			value,
			onChange: (e) => setValue(e.target.value),
			className: "h-10",
			onKeyDown: (e) => {
				if (e.key === "Enter") {
					onRename({
						id: item.id,
						title: value.trim() || item.title
					});
					setEditing(false);
				}
				if (e.key === "Escape") setEditing(false);
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "sm",
			onClick: () => {
				onRename({
					id: item.id,
					title: value.trim() || item.title
				});
				setEditing(false);
			},
			children: "Ok"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onToggle,
				className: "flex min-h-11 items-center pl-1 pr-1",
				"aria-label": item.done ? "Markeer als niet afgerond" : "Markeer als afgerond",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
					checked: item.done,
					className: "pointer-events-none h-5 w-5"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onToggle,
				className: "min-h-11 min-w-0 text-left",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("block text-sm", item.done && "text-muted-foreground line-through"),
					children: item.title
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "h-10 w-10 shrink-0",
					"aria-label": "Acties",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "h-4 w-4" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				align: "end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					onClick: () => setEditing(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-2 h-4 w-4" }), " Hernoemen"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					className: "text-destructive",
					onClick: () => onRemove(item.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 h-4 w-4" }), " Verwijderen"]
				})]
			})] })
		]
	});
}
//#endregion
export { ChecklistPanel as t };

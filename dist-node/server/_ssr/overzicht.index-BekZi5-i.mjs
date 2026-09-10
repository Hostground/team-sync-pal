import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-aEi6Dc2K.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as CardContent, t as Card } from "./card-CtX3ithx.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { A as ChevronRight, E as ClipboardList, F as CalendarDays, M as ChevronDown, j as ChevronLeft, t as X, x as ExternalLink } from "../_libs/lucide-react.mjs";
import { M as redirect, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { o as getActivityOverview } from "./planning.functions-BuySTUZv.mjs";
import { a as Portal, i as Overlay, n as Content, o as Root, r as Description, s as Title, t as Close } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as CollapsibleTrigger$1, r as Root$1, t as CollapsibleContent$1 } from "../_libs/@radix-ui/react-collapsible+[...].mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { n as useCurrentUser, t as isStaff } from "./use-current-user-7eSdy6Gj.mjs";
import { _ as addMonths, a as format, c as endOfYear, d as endOfMonth, f as endOfDay, g as startOfWeek, h as startOfDay, l as startOfMonth, m as addYears, n as isToday, o as endOfWeek, p as isSameDay, r as isSameMonth, s as startOfYear, t as nl, u as eachDayOfInterval, v as addDays } from "../_libs/date-fns.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as DialogHeader, n as Dialog, o as DialogTitle, r as DialogContent, t as Checkbox } from "./dialog-DWXt-hnc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/overzicht.index-BekZi5-i.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Collapsible = Root$1;
var CollapsibleTrigger = CollapsibleTrigger$1;
var CollapsibleContent = CollapsibleContent$1;
var statusLabels = {
	pending: "In afwachting",
	confirmed: "Bevestigd",
	declined: "Geweigerd",
	auto_declined: "Auto-geweigerd",
	cancelled: "Geannuleerd",
	completed: "Afgerond"
};
function statusBadgeVariant(status) {
	switch (status) {
		case "confirmed":
		case "completed": return "default";
		case "pending": return "secondary";
		case "declined":
		case "auto_declined": return "destructive";
		default: return "outline";
	}
}
/** Visible range for a view, used both for rendering and for query filters. */
function visibleRange(view, anchor) {
	switch (view) {
		case "day": return {
			from: startOfDay(anchor),
			to: endOfDay(anchor)
		};
		case "week": return {
			from: startOfWeek(anchor, { weekStartsOn: 1 }),
			to: endOfWeek(anchor, { weekStartsOn: 1 })
		};
		case "month": return {
			from: startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 }),
			to: endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 })
		};
		case "year": return {
			from: startOfYear(anchor),
			to: endOfYear(anchor)
		};
	}
}
function shiftAnchor(view, anchor, dir) {
	switch (view) {
		case "day": return addDays(anchor, dir);
		case "week": return addDays(anchor, 7 * dir);
		case "month": return addMonths(anchor, dir);
		case "year": return addYears(anchor, dir);
	}
}
function rangeTitle(view, anchor) {
	switch (view) {
		case "day": return format(anchor, "EEEE d MMMM yyyy", { locale: nl });
		case "week": {
			const { from, to } = visibleRange("week", anchor);
			return `wk ${format(anchor, "I", { locale: nl })} · ${format(from, "d MMM", { locale: nl })} – ${format(to, "d MMM yyyy", { locale: nl })}`;
		}
		case "month": return format(anchor, "LLLL yyyy", { locale: nl });
		case "year": return format(anchor, "yyyy");
	}
}
function daysOfWeek(anchor) {
	const { from, to } = visibleRange("week", anchor);
	return eachDayOfInterval({
		start: from,
		end: to
	});
}
function monthGridDays(anchor) {
	const { from, to } = visibleRange("month", anchor);
	return eachDayOfInterval({
		start: from,
		end: to
	});
}
function eventsOnDay(events, day) {
	return events.filter((e) => isSameDay(e.start, day) || e.start < startOfDay(day) && e.end > startOfDay(day)).sort((a, b) => a.start.getTime() - b.start.getTime());
}
function countsByDay(events) {
	const m = /* @__PURE__ */ new Map();
	for (const e of events) {
		const k = format(e.start, "yyyy-MM-dd");
		m.set(k, (m.get(k) ?? 0) + 1);
	}
	return m;
}
/** Minutes from midnight, clamped to the given day. */
function dayOffsets(event, day) {
	const dayStart = startOfDay(day).getTime();
	const dayEnd = endOfDay(day).getTime();
	const s = Math.max(event.start.getTime(), dayStart);
	const e = Math.min(Math.max(event.end.getTime(), s + 15 * 6e4), dayEnd);
	return {
		top: (s - dayStart) / 6e4,
		height: Math.max((e - s) / 6e4, 30)
	};
}
/** Side-by-side layout for overlapping events on one day. */
function layoutDay(events, day) {
	const items = events.map((event) => ({
		event,
		...dayOffsets(event, day)
	}));
	items.sort((a, b) => a.top - b.top || b.height - a.height);
	const out = [];
	let cluster = [];
	let clusterEnd = -1;
	const flush = () => {
		if (!cluster.length) return;
		const columns = [];
		const placed = cluster.map((it) => {
			let col = columns.findIndex((end) => end <= it.top);
			if (col === -1) {
				col = columns.length;
				columns.push(0);
			}
			columns[col] = it.top + it.height;
			return {
				...it,
				col
			};
		});
		const cols = columns.length;
		placed.forEach((p) => out.push({
			...p,
			cols
		}));
		cluster = [];
		clusterEnd = -1;
	};
	for (const it of items) {
		if (cluster.length && it.top >= clusterEnd) flush();
		cluster.push(it);
		clusterEnd = Math.max(clusterEnd, it.top + it.height);
	}
	flush();
	return out;
}
var HOURS = Array.from({ length: 24 }, (_, i) => i);
function statusRing(status) {
	switch (status) {
		case "confirmed": return "bg-primary/15 border-primary text-foreground";
		case "pending": return "bg-secondary border-muted-foreground/40 text-foreground";
		case "declined":
		case "auto_declined": return "bg-destructive/10 border-destructive text-foreground";
		default: return "bg-muted border-border text-muted-foreground line-through";
	}
}
function TimeGrid({ days, events, onSelect, onDayHeaderClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("min-w-full", !(days.length === 1) && "min-w-[720px]"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid border-b bg-card sticky top-0 z-10",
				style: { gridTemplateColumns: `3rem repeat(${days.length}, minmax(0,1fr))` },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}), days.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onDayHeaderClick?.(d),
					className: cn("py-2 text-center text-xs border-l", isToday(d) ? "font-semibold text-primary" : "text-muted-foreground"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: format(d, "EEEEEE", { locale: nl }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm",
						children: format(d, "d")
					})]
				}, d.toISOString()))]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative grid",
				style: { gridTemplateColumns: `3rem repeat(${days.length}, minmax(0,1fr))` },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative",
					children: HOURS.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] text-muted-foreground text-right pr-1 -translate-y-1.5",
						style: { height: 48 },
						children: h > 0 && `${String(h).padStart(2, "0")}:00`
					}, h))
				}), days.map((day) => {
					const laid = layoutDay(eventsOnDay(events, day), day);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("relative border-l", isToday(day) && "bg-accent/30"),
						children: [
							HOURS.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border-b border-border/60",
								style: { height: 48 }
							}, h)),
							laid.map(({ event, top, height, col, cols }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onSelect(event),
								className: cn("absolute rounded-md border-l-4 border px-1.5 py-1 text-left text-[11px] overflow-hidden", statusRing(event.status)),
								style: {
									top: top / 60 * 48,
									height: height / 60 * 48 - 2,
									left: `calc(${col / cols * 100}% + 2px)`,
									width: `calc(${100 / cols}% - 4px)`,
									borderLeftColor: event.typeColor ?? void 0
								},
								title: `${event.title} · ${statusLabels[event.status] ?? event.status}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium leading-tight truncate",
										children: event.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "opacity-80 truncate",
										children: [
											format(event.start, "HH:mm"),
											"–",
											format(event.end, "HH:mm")
										]
									}),
									height > 60 && event.assignee && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "opacity-70 truncate",
										children: event.assignee
									})
								]
							}, event.id + day.toISOString())),
							isSameDay(day, /* @__PURE__ */ new Date()) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NowLine, {})
						]
					}, day.toISOString());
				})]
			})]
		})
	});
}
function NowLine() {
	const now = /* @__PURE__ */ new Date();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute left-0 right-0 border-t-2 border-destructive pointer-events-none",
		style: { top: (now.getHours() * 60 + now.getMinutes()) / 60 * 48 }
	});
}
var WEEKDAYS = [
	"ma",
	"di",
	"wo",
	"do",
	"vr",
	"za",
	"zo"
];
function MonthGrid({ anchor, events, onSelect, onDayClick }) {
	const days = monthGridDays(anchor);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-7 border-b",
			children: WEEKDAYS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "py-1.5 text-center text-xs text-muted-foreground",
				children: d
			}, d))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-7",
			children: days.map((day) => {
				const list = eventsOnDay(events, day);
				const outside = !isSameMonth(day, anchor);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("min-h-[84px] border-b border-r p-1 space-y-1", outside && "bg-muted/40"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onDayClick(day),
							className: cn("flex h-6 w-6 items-center justify-center rounded-full text-xs", isToday(day) ? "bg-primary text-primary-foreground font-semibold" : outside ? "text-muted-foreground" : "text-foreground"),
							children: format(day, "d")
						}),
						list.slice(0, 3).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onSelect(e),
							className: "block w-full truncate rounded border-l-4 bg-accent/60 px-1 py-0.5 text-left text-[10px] leading-tight",
							style: { borderLeftColor: e.typeColor ?? void 0 },
							title: `${format(e.start, "HH:mm")} ${e.title}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: format(e.start, "HH:mm")
								}),
								" ",
								e.title
							]
						}, e.id)),
						list.length > 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onDayClick(day),
							className: "text-[10px] text-muted-foreground underline",
							children: [
								"+",
								list.length - 3,
								" meer"
							]
						})
					]
				}, day.toISOString());
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "sr-only",
			children: format(anchor, "LLLL yyyy", { locale: nl })
		})
	] });
}
function YearGrid({ anchor, events, onMonthClick, onDayClick }) {
	const counts = countsByDay(events);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4 p-3 sm:grid-cols-2 lg:grid-cols-3",
		children: Array.from({ length: 12 }, (_, i) => addMonths(startOfYear(anchor), i)).map((m) => {
			const days = eachDayOfInterval({
				start: startOfWeek(startOfMonth(m), { weekStartsOn: 1 }),
				end: endOfWeek(endOfMonth(m), { weekStartsOn: 1 })
			});
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border p-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onMonthClick(m),
					className: "mb-1 w-full text-left text-sm font-medium capitalize hover:underline",
					children: format(m, "LLLL", { locale: nl })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-7 gap-0.5",
					children: [[
						"m",
						"d",
						"w",
						"d",
						"v",
						"z",
						"z"
					].map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-center text-[9px] text-muted-foreground",
						children: d
					}, i)), days.map((day) => {
						const n = counts.get(format(day, "yyyy-MM-dd")) ?? 0;
						const outside = !isSameMonth(day, m);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onDayClick(day),
							title: n > 0 ? `${format(day, "d MMM", { locale: nl })}: ${n} activiteit${n > 1 ? "en" : ""}` : format(day, "d MMM", { locale: nl }),
							className: cn("aspect-square rounded-sm text-[9px] leading-none flex items-center justify-center", outside && "opacity-30", isToday(day) && "ring-1 ring-primary", n === 0 && "bg-muted/40 text-muted-foreground", n === 1 && "bg-primary/25", n === 2 && "bg-primary/50", n >= 3 && "bg-primary/80 text-primary-foreground"),
							children: format(day, "d")
						}, day.toISOString());
					})]
				})]
			}, m.toISOString());
		})
	});
}
var Sheet = Root;
var SheetPortal = Portal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = Overlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Content, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Close, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = Content.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = Title.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = Description.displayName;
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
	const [isMobile, setIsMobile] = import_react.useState(void 0);
	import_react.useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);
	return !!isMobile;
}
function Body({ event }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: statusBadgeVariant(event.status),
					children: statusLabels[event.status] ?? event.status
				}), event.typeName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground",
						style: event.typeColor ? { backgroundColor: event.typeColor } : void 0
					}), event.typeName]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-[6rem_1fr] gap-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: "Wanneer"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
						format(event.start, "EEEE d MMM yyyy", { locale: nl }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						format(event.start, "HH:mm"),
						" – ",
						format(event.end, "HH:mm")
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: "Medewerker"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: event.assignee ?? "—" }),
					event.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: "Locatie"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: event.location })] }),
					event.customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: "Klant"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: event.customer })] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/planning/$id",
					params: { id: event.id },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-4 w-4" }), " Open activiteit"]
				})
			})
		]
	});
}
function EventDetail({ event, onOpenChange }) {
	const isMobile = useIsMobile();
	const open = !!event;
	if (isMobile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "bottom",
			className: "max-h-[85vh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, {
				className: "text-left",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
					className: "pr-6",
					children: event?.title
				})
			}), event && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Body, { event })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "pr-6",
				children: event?.title
			}) }), event && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Body, { event })]
		})
	});
}
function PlanningCalendar({ view, anchor, events, isLoading, onViewChange, onAnchorChange }) {
	const [selected, setSelected] = (0, import_react.useState)(null);
	const scrollRef = (0, import_react.useRef)(null);
	const touchX = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if ((view === "day" || view === "week") && scrollRef.current) scrollRef.current.scrollTop = 336;
	}, [view]);
	const go = (dir) => onAnchorChange(shiftAnchor(view, anchor, dir));
	const openDay = (d) => {
		onAnchorChange(d);
		onViewChange("day");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "p-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 border-b p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "icon",
								onClick: () => go(-1),
								"aria-label": "Vorige",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "icon",
								onClick: () => go(1),
								"aria-label": "Volgende",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => onAnchorChange(/* @__PURE__ */ new Date()),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-4 w-4" }), " Vandaag"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "flex-1 text-sm font-medium capitalize",
						children: rangeTitle(view, anchor)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
						value: view,
						onValueChange: (v) => onViewChange(v),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "day",
								children: "Dag"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "week",
								children: "Week"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "month",
								children: "Maand"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "year",
								children: "Jaar"
							})
						] })
					})
				]
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 py-2 text-xs text-muted-foreground",
				children: "Laden…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: scrollRef,
				className: view === "day" || view === "week" ? "max-h-[70vh] overflow-y-auto relative" : "relative",
				onTouchStart: (e) => {
					touchX.current = e.touches[0]?.clientX ?? null;
				},
				onTouchEnd: (e) => {
					const start = touchX.current;
					const end = e.changedTouches[0]?.clientX ?? null;
					touchX.current = null;
					if (start == null || end == null) return;
					const dx = end - start;
					if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
				},
				children: [
					view === "day" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimeGrid, {
						days: [anchor],
						events,
						onSelect: setSelected
					}),
					view === "week" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimeGrid, {
						days: daysOfWeek(anchor),
						events,
						onSelect: setSelected,
						onDayHeaderClick: openDay
					}),
					view === "month" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthGrid, {
						anchor,
						events,
						onSelect: setSelected,
						onDayClick: openDay
					}),
					view === "year" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YearGrid, {
						anchor,
						events,
						onMonthClick: (d) => {
							onAnchorChange(d);
							onViewChange("month");
						},
						onDayClick: openDay
					})
				]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventDetail, {
		event: selected,
		onOpenChange: (o) => !o && setSelected(null)
	})] });
}
var statusMeta = {
	pending: {
		label: "In afwachting",
		variant: "secondary"
	},
	confirmed: {
		label: "Bevestigd",
		variant: "default"
	},
	declined: {
		label: "Geweigerd",
		variant: "destructive"
	},
	auto_declined: {
		label: "Auto-geweigerd",
		variant: "destructive"
	},
	cancelled: {
		label: "Geannuleerd",
		variant: "outline"
	},
	completed: {
		label: "Afgerond",
		variant: "default"
	}
};
var ALL = "__all__";
function OverviewPage() {
	const { data: me } = useCurrentUser();
	const fetchOverview = useServerFn(getActivityOverview);
	const [status, setStatus] = (0, import_react.useState)(ALL);
	const [assigneeId, setAssigneeId] = (0, import_react.useState)(ALL);
	const [typeId, setTypeId] = (0, import_react.useState)(ALL);
	const [from, setFrom] = (0, import_react.useState)("");
	const [to, setTo] = (0, import_react.useState)("");
	const [onlyUnread, setOnlyUnread] = (0, import_react.useState)(false);
	const [onlyRolling, setOnlyRolling] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)("calendar");
	const [view, setView] = (0, import_react.useState)("week");
	const [anchor, setAnchor] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	const { data: employees = [] } = useQuery({
		queryKey: ["overview-employees"],
		queryFn: async () => {
			const { data } = await supabase.from("profiles").select("id,full_name,email").order("full_name");
			return data ?? [];
		}
	});
	const { data: types = [] } = useQuery({
		queryKey: ["overview-types"],
		queryFn: async () => {
			const { data } = await supabase.from("activity_types").select("id,name").order("name");
			return data ?? [];
		}
	});
	const filters = (0, import_react.useMemo)(() => {
		const range = mode === "calendar" ? visibleRange(view, anchor) : {
			from: from ? new Date(from) : void 0,
			to: to ? /* @__PURE__ */ new Date(to + "T23:59:59") : void 0
		};
		return {
			status: status !== ALL ? status : void 0,
			assignee_id: assigneeId !== ALL ? assigneeId : void 0,
			type_id: typeId !== ALL ? typeId : void 0,
			from: range.from ? range.from.toISOString() : void 0,
			to: range.to ? range.to.toISOString() : void 0,
			only_unread: onlyUnread || void 0,
			only_rolling: onlyRolling || void 0
		};
	}, [
		status,
		assigneeId,
		typeId,
		from,
		to,
		onlyUnread,
		onlyRolling,
		mode,
		view,
		anchor
	]);
	const { data: rows = [], isLoading } = useQuery({
		queryKey: ["overview", filters],
		enabled: isStaff(me?.role),
		queryFn: () => fetchOverview({ data: filters })
	});
	const events = (0, import_react.useMemo)(() => rows.map((a) => ({
		id: a.id,
		title: a.title,
		start: new Date(a.start_at),
		end: new Date(a.end_at),
		status: a.status,
		typeName: a.activity_types?.name ?? null,
		typeColor: a.activity_types?.color ?? null,
		assignee: a.assignee?.full_name ?? a.assignee?.email ?? null,
		location: a.location ?? null,
		customer: a.customer ?? null
	})), [rows]);
	if (!me) return null;
	if (!isStaff(me.role)) throw redirect({ to: "/planning" });
	const reset = () => {
		setStatus(ALL);
		setAssigneeId(ALL);
		setTypeId(ALL);
		setFrom("");
		setTo("");
		setOnlyUnread(false);
		setOnlyRolling(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-6xl mx-auto space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "text-2xl font-bold flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-6 w-6" }), " Overzicht"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Alle activiteiten met meldingsstatus en geschiedenis."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-3 py-4 md:grid-cols-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Status"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: status,
						onValueChange: setStatus,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: ALL,
								children: "Alle"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "pending",
								children: "In afwachting"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "confirmed",
								children: "Bevestigd"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "declined",
								children: "Geweigerd"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "auto_declined",
								children: "Auto-geweigerd"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "cancelled",
								children: "Geannuleerd"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "completed",
								children: "Afgerond"
							})
						] })]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Medewerker"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: assigneeId,
						onValueChange: setAssigneeId,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: ALL,
							children: "Alle"
						}), employees.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: e.id,
							children: e.full_name ?? e.email
						}, e.id))] })]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Type"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: typeId,
						onValueChange: setTypeId,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: ALL,
							children: "Alle"
						}), types.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: t.id,
							children: t.name
						}, t.id))] })]
					})] }),
					mode === "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Van"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: from,
						onChange: (e) => setFrom(e.target.value)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Tot"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: to,
						onChange: (e) => setTo(e.target.value)
					})] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: onlyUnread,
									onCheckedChange: (v) => setOnlyUnread(v === true)
								}), "Alleen ongelezen"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: onlyRolling,
									onCheckedChange: (v) => setOnlyRolling(v === true)
								}), "Alleen lopende"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: reset,
								children: "Reset"
							})
						]
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: mode,
				onValueChange: (v) => setMode(v),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "calendar",
						children: "Kalender"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "list",
						children: "Lijst"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "calendar",
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanningCalendar, {
							view,
							anchor,
							events,
							isLoading,
							onViewChange: setView,
							onAnchorChange: setAnchor
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "list",
						className: "mt-3 space-y-2",
						children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Laden…"
						}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "py-8 text-center text-sm text-muted-foreground",
							children: "Geen activiteiten gevonden."
						}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: rows.map((a) => {
								const st = statusMeta[a.status] ?? statusMeta.pending;
								const notifs = a.notifications ?? [];
								const allDeliveries = notifs.flatMap((n) => n.notification_deliveries ?? []);
								const counts = {
									inapp_unread: allDeliveries.filter((d) => d.channel === "inapp" && !d.read_at).length,
									inapp_read: allDeliveries.filter((d) => d.channel === "inapp" && d.read_at).length,
									email_sent: allDeliveries.filter((d) => d.channel === "email" && d.status === "sent").length,
									email_queued: allDeliveries.filter((d) => d.channel === "email" && d.status === "queued").length,
									push_sent: allDeliveries.filter((d) => d.channel === "push" && d.status === "sent").length,
									push_queued: allDeliveries.filter((d) => d.channel === "push" && d.status === "queued").length
								};
								const lastAudit = (a.activity_audit_log ?? []).slice().sort((x, y) => x.created_at < y.created_at ? 1 : -1)[0];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collapsible, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0 flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [
														a.activity_types?.color && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "inline-block h-2.5 w-2.5 rounded-full",
															style: { backgroundColor: a.activity_types.color }
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "font-medium truncate",
															children: a.title
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: st.variant,
															className: "text-xs",
															children: st.label
														})
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs text-muted-foreground mt-0.5",
													children: [
														format(new Date(a.start_at), "d MMM yyyy HH:mm", { locale: nl }),
														" · ",
														a.assignee?.full_name ?? a.assignee?.email ?? "—"
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap gap-1",
												children: [
													counts.inapp_unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														variant: "secondary",
														className: "text-xs",
														children: [
															"In-app: ",
															counts.inapp_unread,
															" ongelezen"
														]
													}),
													counts.inapp_read > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														variant: "outline",
														className: "text-xs",
														children: [
															"In-app: ",
															counts.inapp_read,
															" gelezen"
														]
													}),
													counts.email_sent > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														variant: "outline",
														className: "text-xs",
														children: [
															"E-mail: ",
															counts.email_sent,
															" verzonden"
														]
													}),
													counts.email_queued > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														variant: "secondary",
														className: "text-xs",
														children: [
															"E-mail: ",
															counts.email_queued,
															" wachtrij"
														]
													}),
													counts.push_sent > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														variant: "outline",
														className: "text-xs",
														children: ["Push: ", counts.push_sent]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												asChild: true,
												variant: "ghost",
												size: "sm",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/planning/$id",
													params: { id: a.id },
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-4 w-4" })
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleTrigger, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "ghost",
													size: "sm",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
												})
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CollapsibleContent, {
										className: "mt-3 space-y-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium mb-1",
											children: "Meldingen"
										}), notifs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Geen meldingen."
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "space-y-2",
											children: notifs.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "border rounded p-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs text-muted-foreground",
													children: [
														n.type,
														" · ",
														format(new Date(n.created_at), "d MMM HH:mm", { locale: nl })
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "flex flex-wrap gap-1 mt-1",
													children: (n.notification_deliveries ?? []).map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														variant: "outline",
														className: "text-xs",
														children: [
															d.channel,
															": ",
															d.read_at ? "gelezen" : d.status
														]
													}, i))
												})]
											}, n.id))
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium mb-1",
												children: "Geschiedenis"
											}),
											(a.activity_audit_log ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Nog geen acties."
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "space-y-1",
												children: a.activity_audit_log.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-xs border-l-2 pl-2 py-1",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-medium",
															children: r.action
														}),
														" · ",
														format(new Date(r.created_at), "d MMM HH:mm", { locale: nl }),
														" · ",
														r.actor?.full_name ?? r.actor?.email ?? "systeem",
														r.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-muted-foreground mt-0.5",
															children: r.note
														})
													]
												}, r.id))
											}),
											lastAudit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[10px] text-muted-foreground mt-2",
												children: [
													"Laatste actie: ",
													lastAudit.action,
													" op",
													" ",
													format(new Date(lastAudit.created_at), "d MMM HH:mm", { locale: nl })
												]
											})
										] })]
									})]
								}) }) }, a.id);
							})
						})
					})
				]
			})
		]
	});
}
//#endregion
export { OverviewPage as component };

import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createSsrRpc } from "./createSsrRpc-8YnnUnRy.mjs";
import { a as stringType, i as objectType } from "../_libs/zod.mjs";
import { t as Route } from "./display._code-C6NlX5l7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/display._code-DPeccJXn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CodeSchema = objectType({ code: stringType().regex(/^[A-Za-z0-9_-]{8,64}$/) });
/**
* Public endpoint for the lobby TV. Authenticated only by the display's secret code.
* Returns display content plus a privacy-limited view of today's planning.
*/
var getDisplayByCode = createServerFn({ method: "GET" }).inputValidator((data) => CodeSchema.parse(data)).handler(createSsrRpc("6a55148ad597e82751c0bfa671caee282e281f6055ae424602d144fb40d769cb"));
/**
* Fullscreen photo backdrop with slow Ken Burns motion and crossfade
* between multiple images belonging to the same slide.
*/
function PhotoBackdrop({ images, seconds }) {
	const [index, setIndex] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (images.length <= 1) return;
		const per = Math.max(4, Math.round(seconds * 1e3 / images.length));
		const t = setInterval(() => setIndex((i) => (i + 1) % images.length), per);
		return () => clearInterval(t);
	}, [images, seconds]);
	(0, import_react.useEffect)(() => setIndex(0), [images]);
	if (images.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 overflow-hidden",
		children: images.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 transition-opacity duration-[1600ms]",
			style: { opacity: i === index ? 1 : 0 },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt: "",
				className: `h-full w-full object-cover ${i % 2 === 0 ? "display-kenburns-a" : "display-kenburns-b"}`
			})
		}, `${src}-${i}`))
	});
}
function PlanningTodaySlide({ items, timezone, title }) {
	const fmt = (iso) => new Intl.DateTimeFormat("nl-BE", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: timezone
	}).format(new Date(iso));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full flex-col justify-center px-[8vw] py-[10vh]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-[4vh] text-[6vh] font-bold leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]",
			children: title ?? "Vandaag"
		}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[3.6vh] opacity-80",
			children: "Geen activiteiten gepland vandaag."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-[2vh]",
			children: items.slice(0, 8).map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-baseline gap-[2vw] rounded-[1vh] bg-black/25 px-[2vw] py-[1.6vh] backdrop-blur-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "w-[16vw] shrink-0 text-[3.6vh] font-semibold tabular-nums",
						children: [
							fmt(it.start),
							"–",
							fmt(it.end)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-1 text-[3.4vh] font-medium",
						children: it.title
					}),
					it.location ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[2.6vh] opacity-80",
						children: it.location
					}) : null,
					it.person ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[2.6vh] opacity-80",
						children: ["· ", it.person]
					}) : null
				]
			}, i))
		})]
	});
}
function ClockOverlay({ timezone, position }) {
	const [now, setNow] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => clearInterval(t);
	}, []);
	const time = new Intl.DateTimeFormat("nl-BE", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: timezone
	}).format(now);
	const date = new Intl.DateTimeFormat("nl-BE", {
		weekday: "long",
		day: "numeric",
		month: "long",
		timeZone: timezone
	}).format(now);
	const pos = {
		"top-left": "top-[4vh] left-[4vw] items-start",
		"top-right": "top-[4vh] right-[4vw] items-end",
		"bottom-left": "bottom-[4vh] left-[4vw] items-start",
		"bottom-right": "bottom-[4vh] right-[4vw] items-end"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `pointer-events-none absolute z-20 flex flex-col ${pos[position] ?? pos["top-right"]}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[9vh] font-semibold leading-none tabular-nums drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]",
			children: time
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-[1vh] text-[2.6vh] capitalize opacity-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]",
			children: date
		})]
	});
}
function SlideShow({ data }) {
	const slides = data.slides;
	const [index, setIndex] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (slides.length === 0) return;
		const current = slides[Math.min(index, slides.length - 1)];
		const ms = Math.max(3, current?.seconds ?? 10) * 1e3;
		const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), ms);
		return () => clearTimeout(t);
	}, [index, slides]);
	(0, import_react.useEffect)(() => {
		if (index >= slides.length) setIndex(0);
	}, [slides.length, index]);
	const theme = data.theme ?? {};
	const bg = theme.bg ?? "#0b1220";
	const text = theme.text ?? "#ffffff";
	const overlay = typeof theme.overlay === "number" ? theme.overlay : .35;
	const scale = typeof theme.textScale === "number" ? theme.textScale : 1;
	const slide = slides[Math.min(index, Math.max(0, slides.length - 1))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-screen w-screen overflow-hidden",
		style: {
			backgroundColor: bg,
			color: text,
			fontSize: `${scale}rem`
		},
		children: [
			slides.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 transition-opacity duration-1000",
				style: {
					opacity: i === index ? 1 : 0,
					zIndex: i === index ? 1 : 0
				},
				children: [
					s.images.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoBackdrop, {
						images: s.images,
						seconds: s.seconds
					}) : null,
					s.images.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0",
						style: { backgroundColor: `rgba(0,0,0,${overlay})` }
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative h-full w-full",
						children: s.kind === "planning_today" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanningTodaySlide, {
							items: data.today,
							timezone: data.timezone,
							title: s.title
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex h-full w-full flex-col justify-center px-[8vw]",
							children: [s.title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-[8vh] font-bold leading-[1.05] drop-shadow-[0_2px_16px_rgba(0,0,0,0.65)]",
								style: { transform: `scale(1)` },
								children: s.title
							}) : null, s.body ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-[3vh] max-w-[70vw] whitespace-pre-line text-[4vh] leading-snug opacity-95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]",
								children: s.body
							}) : null]
						})
					})
				]
			}, s.id)),
			slides.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full w-full items-center justify-center text-[4vh] opacity-70",
				children: "Nog geen slides ingesteld"
			}) : null,
			data.show_clock ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockOverlay, {
				timezone: data.timezone,
				position: data.clock_position
			}) : null,
			slides.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute bottom-[3vh] left-1/2 z-20 flex -translate-x-1/2 gap-[1vw]",
				children: slides.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "h-[0.9vh] w-[0.9vh] rounded-full transition-opacity",
					style: {
						backgroundColor: text,
						opacity: i === index ? .95 : .35
					}
				}, s.id))
			}) : null,
			slide ? null : null
		]
	});
}
function DisplayScreen() {
	const { code } = Route.useParams();
	const { data, isLoading } = useQuery({
		queryKey: ["display", code],
		queryFn: () => getDisplayByCode({ data: { code } }),
		refetchInterval: 6e4,
		refetchOnWindowFocus: true
	});
	(0, import_react.useEffect)(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "";
		};
	}, []);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex h-screen w-screen items-center justify-center bg-[#0b1220] text-white/60" });
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-screen w-screen items-center justify-center bg-[#0b1220] text-center text-white/80",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-semibold",
			children: "Infoscherm niet gevonden"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 opacity-70",
			children: "Controleer de link of vraag een nieuwe code aan."
		})] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlideShow, { data });
}
//#endregion
export { DisplayScreen as component };

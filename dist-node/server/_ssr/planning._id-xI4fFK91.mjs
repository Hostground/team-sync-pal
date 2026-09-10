import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-aEi6Dc2K.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-CtX3ithx.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { L as Bell, O as CircleCheck, P as Camera, T as Clock, b as FileText, g as MapPin, i as Trash2, j as ChevronLeft, l as Repeat, p as Navigation, r as User, t as X, w as Copy, y as ImagePlus } from "../_libs/lucide-react.mjs";
import { _ as useNavigate, y as ClientOnly } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BBZdFWpw.mjs";
import { t as createSsrRpc } from "./createSsrRpc-8YnnUnRy.mjs";
import { a as stringType, i as objectType, r as numberType } from "../_libs/zod.mjs";
import { a as getActivityAuditLog, c as respondActivity, l as setActivityLocation, r as completeActivity } from "./planning.functions-BuySTUZv.mjs";
import { n as useCurrentUser, t as isStaff } from "./use-current-user-7eSdy6Gj.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { a as format, t as nl } from "../_libs/date-fns.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Route } from "./planning._id-Bz-R6Tku.mjs";
import { t as ChecklistPanel } from "./ChecklistPanel-BchV0M8h.mjs";
import { t as LocationPicker } from "./LocationPicker-DCTQg3k1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/planning._id-xI4fFK91.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Placeholder = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: "h-64 w-full rounded-md border bg-muted/40 flex items-center justify-center text-sm text-muted-foreground",
	children: "Kaart laden…"
});
function ActivityMap({ point, photoPins = [], label }) {
	const copy = async () => {
		await navigator.clipboard.writeText(`${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`);
		toast.success("Coördinaten gekopieerd");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, { fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Placeholder, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`,
						target: "_blank",
						rel: "noreferrer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "h-4 w-4 mr-1" }), " Route"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: copy,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4 mr-1" }), " Coördinaten"]
				}),
				label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: label
				})
			]
		})]
	});
}
/** Foto's van een activiteit, met tijdelijke kijk-URL's. */
var listActivityPhotos = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ activity_id: stringType().uuid() }).parse(d)).handler(createSsrRpc("be20f9a7c808a8be18233cc4217b7bfb271582fcf74c2bd07a81f1a30236858c"));
/** Signed upload-URL zodat de browser het bestand direct kan uploaden. */
var createPhotoUploadUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	activity_id: stringType().uuid(),
	filename: stringType().min(1).max(120)
}).parse(d)).handler(createSsrRpc("b7677cd206e3c0391100ea729e605bc3e5ec730eaaa7357d6c47df2aaf4df1c9"));
/** Registreer een geüploade foto in de database. */
var registerActivityPhoto = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	activity_id: stringType().uuid(),
	storage_path: stringType().min(1),
	caption: stringType().max(300).nullable().optional(),
	lat: numberType().min(-90).max(90).nullable().optional(),
	lng: numberType().min(-180).max(180).nullable().optional(),
	taken_at: stringType().nullable().optional()
}).parse(d)).handler(createSsrRpc("9bef081177ea575fa2cb4b6bdc094559f290842d5d0862e9e8a68adb12f88082"));
var deleteActivityPhoto = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ photo_id: stringType().uuid() }).parse(d)).handler(createSsrRpc("de88b8ced65b2b060429531ad6b9d53670d3d2d9e07e392ff1fe4b4d591673fd"));
function getPosition() {
	return new Promise((resolve) => {
		if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
		let done = false;
		const finish = (v) => {
			if (done) return;
			done = true;
			resolve(v);
		};
		const timer = setTimeout(() => finish(null), 5e3);
		try {
			navigator.geolocation.getCurrentPosition((p) => {
				clearTimeout(timer);
				finish({
					lat: p.coords.latitude,
					lng: p.coords.longitude
				});
			}, () => {
				clearTimeout(timer);
				finish(null);
			}, {
				enableHighAccuracy: false,
				timeout: 4e3,
				maximumAge: 12e4
			});
		} catch {
			clearTimeout(timer);
			finish(null);
		}
	});
}
function uploadWithProgress(file, url, onProgress) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("PUT", url, true);
		xhr.setRequestHeader("Content-Type", file.type);
		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100));
			else onProgress(50);
		};
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) resolve();
			else reject(/* @__PURE__ */ new Error(`Upload mislukt (${xhr.status})`));
		};
		xhr.onerror = () => reject(/* @__PURE__ */ new Error("Netwerkfout bij uploaden"));
		xhr.onabort = () => reject(/* @__PURE__ */ new Error("Upload geannuleerd"));
		xhr.send(file);
	});
}
function ActivityPhotos({ activityId, canEdit, currentUserId, isStaffUser, onPhotosChange }) {
	const list = useServerFn(listActivityPhotos);
	const makeUrl = useServerFn(createPhotoUploadUrl);
	const register = useServerFn(registerActivityPhoto);
	const remove = useServerFn(deleteActivityPhoto);
	const [withLocation, setWithLocation] = (0, import_react.useState)(true);
	const [busy, setBusy] = (0, import_react.useState)(0);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [zoom, setZoom] = (0, import_react.useState)(null);
	const galleryRef = (0, import_react.useRef)(null);
	const cameraRef = (0, import_react.useRef)(null);
	const { data: photos = [], refetch } = useQuery({
		queryKey: ["activity-photos", activityId],
		queryFn: async () => {
			const rows = await list({ data: { activity_id: activityId } });
			onPhotosChange?.(rows);
			return rows;
		}
	});
	const upload = async (files) => {
		if (!files || files.length === 0) return;
		const selectedFiles = Array.from(files);
		setBusy(selectedFiles.length);
		setProgress(0);
		const positionPromise = withLocation ? getPosition() : Promise.resolve(null);
		let ok = 0;
		for (let i = 0; i < selectedFiles.length; i++) {
			const file = selectedFiles[i];
			try {
				if (!file.type.startsWith("image/")) throw new Error("Alleen afbeeldingen");
				const { path, signedUrl } = await makeUrl({ data: {
					activity_id: activityId,
					filename: file.name
				} });
				await uploadWithProgress(file, signedUrl, (pct) => {
					setProgress(Math.round((i + pct / 100) / selectedFiles.length * 100));
				});
				const pos = await positionPromise;
				await register({ data: {
					activity_id: activityId,
					storage_path: path,
					lat: pos?.lat ?? null,
					lng: pos?.lng ?? null,
					taken_at: new Date(file.lastModified || Date.now()).toISOString()
				} });
				ok++;
			} catch (e) {
				toast.error(e.message ?? "Uploaden mislukt");
			} finally {
				setBusy((b) => b - 1);
			}
		}
		const pos = await positionPromise;
		if (withLocation && !pos) toast.info("Locatie niet beschikbaar – foto wordt zonder locatie bewaard");
		setProgress(0);
		if (ok > 0) {
			toast.success(ok === 1 ? "Foto toegevoegd" : `${ok} foto's toegevoegd`);
			refetch();
		}
	};
	const del = async (p) => {
		try {
			await remove({ data: { photo_id: p.id } });
			toast.success("Foto verwijderd");
			setZoom(null);
			refetch();
		} catch (e) {
			toast.error(e.message ?? "Verwijderen mislukt");
		}
	};
	const mayDelete = (p) => canEdit && (isStaffUser || p.uploaded_by === currentUserId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-4 w-4" }),
					" Foto's",
					photos.length > 0 && ` (${photos.length})`
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-3",
			children: [canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						onClick: () => cameraRef.current?.click(),
						disabled: busy > 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-4 w-4 mr-1" }), " Camera"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						onClick: () => galleryRef.current?.click(),
						disabled: busy > 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-4 w-4 mr-1" }), " Galerij"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: cameraRef,
					type: "file",
					accept: "image/*",
					capture: "environment",
					className: "hidden",
					onChange: (e) => {
						upload(e.target.files);
						e.target.value = "";
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: galleryRef,
					type: "file",
					accept: "image/*",
					multiple: true,
					className: "hidden",
					onChange: (e) => {
						upload(e.target.files);
						e.target.value = "";
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: withLocation,
						onChange: (e) => setWithLocation(e.target.checked)
					}), "Locatie meesturen met de foto"]
				}),
				busy > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1.5 w-full bg-muted rounded-full overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-primary transition-all duration-200",
							style: { width: `${progress}%` }
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"Uploaden… ",
							progress,
							"%"
						]
					})]
				})
			] }), photos.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Nog geen foto's."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-2",
				children: photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setZoom(p),
					className: "relative aspect-square overflow-hidden rounded-md border",
					children: [p.url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: p.url,
						alt: p.caption ?? "Foto bij activiteit",
						loading: "lazy",
						className: "h-full w-full object-cover"
					}), p.lat != null && p.lng != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute bottom-1 right-1 rounded bg-background/80 p-0.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" })
					})]
				}, p.id))
			})]
		}),
		zoom && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4",
			onClick: () => setZoom(null),
			children: [zoom.url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: zoom.url,
				alt: zoom.caption ?? "Foto",
				className: "max-h-[80vh] max-w-full rounded"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center gap-2",
				onClick: (e) => e.stopPropagation(),
				children: [
					zoom.taken_at && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-white/80",
						children: format(new Date(zoom.taken_at), "d MMM yyyy HH:mm", { locale: nl })
					}),
					zoom.lat != null && zoom.lng != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						variant: "secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `https://www.openstreetmap.org/?mlat=${zoom.lat}&mlon=${zoom.lng}#map=17/${zoom.lat}/${zoom.lng}`,
							target: "_blank",
							rel: "noreferrer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 mr-1" }), " Op kaart"]
						})
					}),
					mayDelete(zoom) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "destructive",
						onClick: () => del(zoom),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 mr-1" }), " Verwijderen"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						className: "text-white",
						onClick: () => setZoom(null),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})
				]
			})]
		})
	] });
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
function ActivityDetail() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const { data: me } = useCurrentUser();
	const respond = useServerFn(respondActivity);
	const complete = useServerFn(completeActivity);
	const [note, setNote] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [photos, setPhotos] = (0, import_react.useState)([]);
	const [editPin, setEditPin] = (0, import_react.useState)(false);
	const [pin, setPin] = (0, import_react.useState)(null);
	const saveLocation = useServerFn(setActivityLocation);
	const { data: a, refetch } = useQuery({
		queryKey: ["activity", id],
		queryFn: async () => {
			const { data: act } = await supabase.from("activities").select("*, activity_types(name,color)").eq("id", id).maybeSingle();
			if (!act) return null;
			const ids = Array.from(new Set([act.assignee_id, act.created_by]));
			const { data: profs } = await supabase.from("profiles").select("id,full_name,email").in("id", ids);
			const map = new Map((profs ?? []).map((p) => [p.id, p]));
			return {
				...act,
				assignee: map.get(act.assignee_id),
				creator: map.get(act.created_by)
			};
		}
	});
	const { data: deliveries = [] } = useQuery({
		queryKey: ["activity-deliveries", id],
		enabled: !!a && isStaff(me?.role),
		queryFn: async () => {
			const { data } = await supabase.from("notifications").select("id,type,created_at,notification_deliveries(channel,status,sent_at,read_at)").eq("activity_id", id).order("created_at", { ascending: false });
			return data ?? [];
		}
	});
	const fetchAudit = useServerFn(getActivityAuditLog);
	const { data: audit = [] } = useQuery({
		queryKey: ["activity-audit", id],
		enabled: !!a && isStaff(me?.role),
		queryFn: () => fetchAudit({ data: { activity_id: id } })
	});
	if (!a) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Laden…"
	});
	const st = statusMeta[a.status] ?? statusMeta.pending;
	const isAssignee = me?.user.id === a.assignee_id;
	const canRespond = isAssignee && a.status === "pending";
	const canEditPin = isAssignee || isStaff(me?.role);
	const canComplete = (isAssignee || isStaff(me?.role)) && !["completed", "cancelled"].includes(a.status);
	const handle = async (action) => {
		setLoading(true);
		try {
			await respond({ data: {
				activity_id: id,
				action,
				note: note || void 0
			} });
			toast.success(action === "confirm" ? "Bevestigd" : "Geweigerd");
			refetch();
		} catch (e) {
			toast.error(e.message);
		} finally {
			setLoading(false);
		}
	};
	const handleComplete = async () => {
		setLoading(true);
		try {
			await complete({ data: { activity_id: id } });
			toast.success("Activiteit afgerond");
			refetch();
		} catch (e) {
			toast.error(e.message);
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => navigate({ to: "/planning" }),
				className: "inline-flex items-center text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" }), " Terug"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2",
					children: [a.activity_types?.color && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-block h-3 w-3 rounded-full",
						style: { backgroundColor: a.activity_types.color }
					}), a.title]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: a.activity_types?.name ?? "Geen type"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-end gap-1 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: st.variant,
						children: st.label
					}), a.is_rolling && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "h-3 w-3 mr-1" }), " Lopend"]
					})]
				})]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-muted-foreground" }),
							format(new Date(a.start_at), "EEEE d MMMM yyyy HH:mm", { locale: nl }),
							" –",
							" ",
							format(new Date(a.end_at), "HH:mm")
						]
					}),
					a.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 text-muted-foreground" }),
							" ",
							a.location
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4 text-muted-foreground" }),
							"Toegewezen aan ",
							a.assignee?.full_name ?? a.assignee?.email
						]
					}),
					a.description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 text-muted-foreground mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "whitespace-pre-wrap",
							children: a.description
						})]
					}),
					a.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs " + (new Date(a.respond_by) < /* @__PURE__ */ new Date() ? "text-destructive font-medium" : "text-muted-foreground"),
						children: [new Date(a.respond_by) < /* @__PURE__ */ new Date() ? "Verlopen — " : "Reageren voor ", format(new Date(a.respond_by), "EEE d MMM HH:mm", { locale: nl })]
					}),
					a.is_rolling && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"Lopende activiteit — schuift automatisch door naar de volgende dag zolang ze niet afgerond is.",
							a.rollover_count > 0 && ` Al ${a.rollover_count}× doorgeschoven.`,
							a.original_start_at && ` Oorspronkelijk gepland op ${format(new Date(a.original_start_at), "d MMM yyyy HH:mm", { locale: nl })}.`
						]
					}),
					a.completed_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: ["Afgerond op ", format(new Date(a.completed_at), "d MMM yyyy HH:mm", { locale: nl })]
					}),
					a.response_note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded border p-2 bg-muted/30",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium",
							children: "Reactie van medewerker"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: a.response_note
						})]
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "pb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-base flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4" }), " Locatie"]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-3",
				children: editPin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationPicker, {
					value: pin,
					onChange: setPin
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: async () => {
							try {
								await saveLocation({ data: {
									activity_id: id,
									lat: pin?.lat ?? null,
									lng: pin?.lng ?? null
								} });
								toast.success("Locatie opgeslagen");
								setEditPin(false);
								refetch();
							} catch (e) {
								toast.error(e.message);
							}
						},
						children: "Opslaan"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => setEditPin(false),
						children: "Annuleren"
					})]
				})] }) : a.lat != null && a.lng != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityMap, {
					point: {
						lat: a.lat,
						lng: a.lng
					},
					photoPins: photos.filter((p) => p.lat != null && p.lng != null).map((p) => ({
						lat: p.lat,
						lng: p.lng,
						title: "Foto"
					})),
					label: a.location ?? null
				}), canEditPin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => {
						setPin({
							lat: a.lat,
							lng: a.lng
						});
						setEditPin(true);
					},
					children: "Pin aanpassen"
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Nog geen pin op de kaart gezet."
				}), canEditPin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => setEditPin(true),
					children: "Pin op kaart zetten"
				})] })
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityPhotos, {
				activityId: id,
				canEdit: isAssignee || isStaff(me?.role),
				currentUserId: me?.user.id,
				isStaffUser: isStaff(me?.role),
				onPhotosChange: setPhotos
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChecklistPanel, {
				activityId: id,
				onAllDone: canComplete ? async () => {
					try {
						await complete({ data: {
							activity_id: id,
							auto: true
						} });
						toast.success("Alle taken klaar — activiteit afgerond");
						refetch();
					} catch {}
				} : void 0
			}),
			canComplete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "w-full",
				variant: "secondary",
				disabled: loading,
				onClick: handleComplete,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 mr-1" }), " Activiteit afronden"]
			}),
			canRespond && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Bevestig of weiger"
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					placeholder: "Notitie (optioneel)",
					value: note,
					onChange: (e) => setNote(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-1",
						disabled: loading,
						onClick: () => handle("confirm"),
						children: "Bevestigen"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "destructive",
						className: "flex-1",
						disabled: loading,
						onClick: () => handle("decline"),
						children: "Weigeren"
					})]
				})]
			})] }),
			isStaff(me?.role) && deliveries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" }), " Meldingsstatus"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-3 text-sm",
				children: deliveries.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b pb-2 last:border-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							n.type,
							" · ",
							format(new Date(n.created_at), "d MMM HH:mm", { locale: nl })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2 mt-1",
						children: n.notification_deliveries.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
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
			})] }),
			isStaff(me?.role) && audit.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }), " Geschiedenis"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-2 text-sm",
				children: audit.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b pb-2 last:border-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "text-xs",
								children: r.action
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: format(new Date(r.created_at), "d MMM yyyy HH:mm", { locale: nl })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: [
								"door ",
								r.actor?.full_name ?? r.actor?.email ?? "systeem",
								r.previous_status && r.new_status && ` · ${r.previous_status} → ${r.new_status}`
							]
						}),
						r.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm mt-1 whitespace-pre-wrap",
							children: r.note
						})
					]
				}, r.id))
			})] })
		]
	});
}
//#endregion
export { ActivityDetail as component };

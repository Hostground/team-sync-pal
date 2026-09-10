globalThis.__nitro_main__ = import.meta.url;
import { a as toEventHandler, c as NodeResponse, i as defineLazyEventHandler, l as serve, n as HTTPError, r as defineHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-09-10T20:49:49.632Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/assets/Combination-DHFRmnVW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b25f-hxOVztIpJsxed/WrqIzsXfK7hs8\"",
		"mtime": "2026-09-10T20:49:48.006Z",
		"size": 45663,
		"path": "../public/assets/Combination-DHFRmnVW.js"
	},
	"/assets/ChecklistPanel-BFIj-HVq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"97b0-iEr/BtGbl11+QKRl1NqJFJBLyVM\"",
		"mtime": "2026-09-10T20:49:48.006Z",
		"size": 38832,
		"path": "../public/assets/ChecklistPanel-BFIj-HVq.js"
	},
	"/assets/LocationPicker-BMJLy_PP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9ed-GcNQm3dqoC/nlMkxRClus2XVZcs\"",
		"mtime": "2026-09-10T20:49:48.007Z",
		"size": 2541,
		"path": "../public/assets/LocationPicker-BMJLy_PP.js"
	},
	"/assets/MapCore-wB8MYJwX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"257f2-UWWueDcEftNWhr32Ggtnqvmkp6Y\"",
		"mtime": "2026-09-10T20:49:48.007Z",
		"size": 153586,
		"path": "../public/assets/MapCore-wB8MYJwX.js"
	},
	"/assets/admin.types-CWt4ICXT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"89f-nXN5145GKoBVENbZBKKKHSR4cmw\"",
		"mtime": "2026-09-10T20:49:48.007Z",
		"size": 2207,
		"path": "../public/assets/admin.types-CWt4ICXT.js"
	},
	"/assets/admin.users-DlN-VLR6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d4b-lr4TTFeReZWIjh8fIDZSb4MIAdo\"",
		"mtime": "2026-09-10T20:49:48.007Z",
		"size": 3403,
		"path": "../public/assets/admin.users-DlN-VLR6.js"
	},
	"/assets/auth-CtrR3piH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"27b6-nZYRtFdzbxjFKZLd1oL6Y+LBtgQ\"",
		"mtime": "2026-09-10T20:49:48.007Z",
		"size": 10166,
		"path": "../public/assets/auth-CtrR3piH.js"
	},
	"/assets/badge-D2uyN0O1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"303-SKYFtKkU5tOf4NrMKsH4bEqVBgo\"",
		"mtime": "2026-09-10T20:49:48.007Z",
		"size": 771,
		"path": "../public/assets/badge-D2uyN0O1.js"
	},
	"/assets/bell-DSrxcsd_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"122-bKi+Sb7vmK4xe2bsXx8P/XUczf0\"",
		"mtime": "2026-09-10T20:49:48.007Z",
		"size": 290,
		"path": "../public/assets/bell-DSrxcsd_.js"
	},
	"/assets/card-DE50EUvp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"422-rD10H4fx87z+lgYIviXnG/fu13E\"",
		"mtime": "2026-09-10T20:49:48.007Z",
		"size": 1058,
		"path": "../public/assets/card-DE50EUvp.js"
	},
	"/assets/check-CZV7F85j.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7c-GuWCQOH3/uQUpNUYbbK8AvypIJ4\"",
		"mtime": "2026-09-10T20:49:48.007Z",
		"size": 124,
		"path": "../public/assets/check-CZV7F85j.js"
	},
	"/assets/MapCore-vh-t_kPv.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"3af7-hJRdDJQQrsTdSxJ69xb7a611WZ4\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 15095,
		"path": "../public/assets/MapCore-vh-t_kPv.css"
	},
	"/assets/chevron-left-CgKLoroi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"82-sQGmmcbdkPuToQf6ngiSV1Qy3k0\"",
		"mtime": "2026-09-10T20:49:48.008Z",
		"size": 130,
		"path": "../public/assets/chevron-left-CgKLoroi.js"
	},
	"/assets/createServerFn-DWEU51TR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1142-Gu9hvTf069v2f+oD5RdGpq3vsYk\"",
		"mtime": "2026-09-10T20:49:48.008Z",
		"size": 4418,
		"path": "../public/assets/createServerFn-DWEU51TR.js"
	},
	"/assets/display._code-BK8hb1qZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16e7-9/r3V/ohRGBzianmFGEH3gXGuqY\"",
		"mtime": "2026-09-10T20:49:48.008Z",
		"size": 5863,
		"path": "../public/assets/display._code-BK8hb1qZ.js"
	},
	"/assets/dialog-7ZilhNJW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"30ed-vuYQwt9xxiP3YShmQhd2MLzH6bo\"",
		"mtime": "2026-09-10T20:49:48.008Z",
		"size": 12525,
		"path": "../public/assets/dialog-7ZilhNJW.js"
	},
	"/assets/display.index-BMB_tOv7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"307e-5LUi3ApUwhnuJ+fb1TSXEijimck\"",
		"mtime": "2026-09-10T20:49:48.008Z",
		"size": 12414,
		"path": "../public/assets/display.index-BMB_tOv7.js"
	},
	"/assets/createLucideIcon-CySJgRsE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"97b-ddOnDuzjsC3Q69RBo4Y9+1432Tw\"",
		"mtime": "2026-09-10T20:49:48.008Z",
		"size": 2427,
		"path": "../public/assets/createLucideIcon-CySJgRsE.js"
	},
	"/assets/dist-CYYaSP1L.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"71e3-8ilTS1hIDYbwQHzRYC4lDLumH8o\"",
		"mtime": "2026-09-10T20:49:48.008Z",
		"size": 29155,
		"path": "../public/assets/dist-CYYaSP1L.js"
	},
	"/assets/dist-DGBdhor7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10bc-aZXILjSYD4uPjLujy3MaoaQdc78\"",
		"mtime": "2026-09-10T20:49:48.008Z",
		"size": 4284,
		"path": "../public/assets/dist-DGBdhor7.js"
	},
	"/assets/dist-Dg1rVU4R2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b87-qGn6QoikdxHkrGlipdUlOdU/adE\"",
		"mtime": "2026-09-10T20:49:48.010Z",
		"size": 2951,
		"path": "../public/assets/dist-Dg1rVU4R2.js"
	},
	"/assets/clipboard-list-BccDLxMC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"354-222GzerZeeR5WTj8GEb2Q7tEQho\"",
		"mtime": "2026-09-10T20:49:48.008Z",
		"size": 852,
		"path": "../public/assets/clipboard-list-BccDLxMC.js"
	},
	"/assets/copy-CkazfR1m.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ec-DKyQ5x5Xh/DELdXb5L5964rs2yw\"",
		"mtime": "2026-09-10T20:49:48.008Z",
		"size": 236,
		"path": "../public/assets/copy-CkazfR1m.js"
	},
	"/assets/dist-CRqs0WZh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2de-jWey3PGv+7QrkJ7EpSc3eiBfymU\"",
		"mtime": "2026-09-10T20:49:48.008Z",
		"size": 734,
		"path": "../public/assets/dist-CRqs0WZh.js"
	},
	"/assets/dist-iYVgn_Fa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"157b-FczzQFh5yUR1fA2oNrUHlEP4d/0\"",
		"mtime": "2026-09-10T20:49:48.013Z",
		"size": 5499,
		"path": "../public/assets/dist-iYVgn_Fa.js"
	},
	"/assets/endOfMonth-tgs7XKuS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"128-lt+fQdTjqEbTqWrsaAxD4pUEnN0\"",
		"mtime": "2026-09-10T20:49:48.013Z",
		"size": 296,
		"path": "../public/assets/endOfMonth-tgs7XKuS.js"
	},
	"/assets/format-1AxZeh9e.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2e9b-A7QOYxltFB7LzmNMCRBFpR7jIo8\"",
		"mtime": "2026-09-10T20:49:48.013Z",
		"size": 11931,
		"path": "../public/assets/format-1AxZeh9e.js"
	},
	"/assets/external-link-CHC7UUD6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fb-4hlkga3CBRKUGARP6NpcgVWwpt8\"",
		"mtime": "2026-09-10T20:49:48.013Z",
		"size": 251,
		"path": "../public/assets/external-link-CHC7UUD6.js"
	},
	"/assets/file-text-Bn_0VXpf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"181-G9f9rDZf/8vMsf5BTRMiDRbh6AA\"",
		"mtime": "2026-09-10T20:49:48.013Z",
		"size": 385,
		"path": "../public/assets/file-text-Bn_0VXpf.js"
	},
	"/assets/image-plus-CSAXQfao.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16b-tVSLG+yBEIJfjD3Rf7z40+r7aGQ\"",
		"mtime": "2026-09-10T20:49:48.013Z",
		"size": 363,
		"path": "../public/assets/image-plus-CSAXQfao.js"
	},
	"/assets/input-BsoYnfiD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"26c-S9L+J84+MMojZuLAwOv9swuUDP0\"",
		"mtime": "2026-09-10T20:49:48.013Z",
		"size": 620,
		"path": "../public/assets/input-BsoYnfiD.js"
	},
	"/assets/jsx-runtime-CBeXhfNn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2e71-uMNia5tYQCU/kbcmupqiEOJtyOA\"",
		"mtime": "2026-09-10T20:49:48.014Z",
		"size": 11889,
		"path": "../public/assets/jsx-runtime-CBeXhfNn.js"
	},
	"/assets/link-CtkZoHxT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5a81-430ChfsfBFgoSXigUlyuHgob7j4\"",
		"mtime": "2026-09-10T20:49:48.014Z",
		"size": 23169,
		"path": "../public/assets/link-CtkZoHxT.js"
	},
	"/assets/monitor-DyyXz3QI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"103-6XpyeCPQUEB3l11cMB9mq9Nu/x8\"",
		"mtime": "2026-09-10T20:49:48.014Z",
		"size": 259,
		"path": "../public/assets/monitor-DyyXz3QI.js"
	},
	"/assets/list-checks-CnvvfzDx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"117-J/A8smIHkq+aN4LZ8nC+kE3aogU\"",
		"mtime": "2026-09-10T20:49:48.014Z",
		"size": 279,
		"path": "../public/assets/list-checks-CnvvfzDx.js"
	},
	"/assets/overzicht.index-DHa188VS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6af4-UlI6y8ExMg5eBT3/B5IKSGbbLv0\"",
		"mtime": "2026-09-10T20:49:48.014Z",
		"size": 27380,
		"path": "../public/assets/overzicht.index-DHa188VS.js"
	},
	"/assets/notifications.index-DYB5rq7r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10dc-HOF6TMw8vaowvlnGJ9439LeSvAY\"",
		"mtime": "2026-09-10T20:49:48.014Z",
		"size": 4316,
		"path": "../public/assets/notifications.index-DYB5rq7r.js"
	},
	"/assets/planning.functions-BLX2lxSD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4d3-3dY1yj0dim7i2Cfz3NtJUGjH5p4\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 1235,
		"path": "../public/assets/planning.functions-BLX2lxSD.js"
	},
	"/assets/map-pin-DSqSsGMQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"103-xSKHMb/pOsTajwxxKeM9W9yMdwQ\"",
		"mtime": "2026-09-10T20:49:48.014Z",
		"size": 259,
		"path": "../public/assets/map-pin-DSqSsGMQ.js"
	},
	"/assets/planning.index-BWm5P0-O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe4-zmDitbnDOeUZKyYXKVBLrHrmSbw\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 4068,
		"path": "../public/assets/planning.index-BWm5P0-O.js"
	},
	"/assets/nl-BI4MU6EO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"306d-DauTfpI5YMvcpl84ebjjdpt7GYE\"",
		"mtime": "2026-09-10T20:49:48.014Z",
		"size": 12397,
		"path": "../public/assets/nl-BI4MU6EO.js"
	},
	"/assets/plus-Bu_66CUl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"99-6u48uTKYdmlEVQkGAWM7273Q31I\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 153,
		"path": "../public/assets/plus-Bu_66CUl.js"
	},
	"/assets/label-CUsJbVal.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3bc-7GW+GqnERGbW13YCd4uR7u4+VMQ\"",
		"mtime": "2026-09-10T20:49:48.014Z",
		"size": 956,
		"path": "../public/assets/label-CUsJbVal.js"
	},
	"/assets/repeat-Z5p0r55K.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"184-g2x6lmt5H/Hp+n+i/fc1WAfQqzg\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 388,
		"path": "../public/assets/repeat-Z5p0r55K.js"
	},
	"/assets/planning._id-jbnxj7Yw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"45b3-ZSc66vlKDJaNdc73kTLDoQgDgeU\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 17843,
		"path": "../public/assets/planning._id-jbnxj7Yw.js"
	},
	"/assets/planning.new-D6QNeDfL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1894-m1mz/Mj1SZQ9GcA4n12Js9SIcww\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 6292,
		"path": "../public/assets/planning.new-D6QNeDfL.js"
	},
	"/assets/redirect-CaDPrkdo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3b2-9bBwbwrhH/PEZYK8mBAWNTld9MU\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 946,
		"path": "../public/assets/redirect-CaDPrkdo.js"
	},
	"/assets/index-CGwyXVMV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8824b-fApVwYolvC9Oo83AZ4AIHBPJZoQ\"",
		"mtime": "2026-09-10T20:49:48.006Z",
		"size": 557643,
		"path": "../public/assets/index-CGwyXVMV.js"
	},
	"/assets/route-BrJ8GYxf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"175e-6Vpzyd+r1FTFjaR/meQnwMAeVzc\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 5982,
		"path": "../public/assets/route-BrJ8GYxf.js"
	},
	"/assets/settings.index-BAhMrLfE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7ce-cgQ/uWyQS4Gjw3GVs+k4U7yhlNA\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 1998,
		"path": "../public/assets/settings.index-BAhMrLfE.js"
	},
	"/assets/select-BF-YvajL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"585a-pYwOqTJ4nWyguJ5B5nyQs0/2dGc\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 22618,
		"path": "../public/assets/select-BF-YvajL.js"
	},
	"/assets/tabs-1y7jM92y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d4a-KXj+ODMPv2rDr5DuIywSS8pHYZE\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 3402,
		"path": "../public/assets/tabs-1y7jM92y.js"
	},
	"/assets/templates.index-DTFyKBuF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18cb-bVqaLGQZU7cmcwyWN1xlciulVRs\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 6347,
		"path": "../public/assets/templates.index-DTFyKBuF.js"
	},
	"/assets/taken.index-BRKBt4OC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1cc-rWKFkuQ9btKOru9owTbD4/+fzLQ\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 460,
		"path": "../public/assets/taken.index-BRKBt4OC.js"
	},
	"/assets/textarea-CYVTanfl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"206-7ozJWMI5/S+sqDTwNihruzcZW98\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 518,
		"path": "../public/assets/textarea-CYVTanfl.js"
	},
	"/assets/trash-2-C8s2wU8t.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"148-5GVlKq1eHq6me5YI11Yd50WjmaI\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 328,
		"path": "../public/assets/trash-2-C8s2wU8t.js"
	},
	"/assets/styles-RqDvpcz4.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"14c65-BD5ypcirKaDmtTtQUOckrQ2aWRg\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 85093,
		"path": "../public/assets/styles-RqDvpcz4.css"
	},
	"/assets/switch-CsWpWmEF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a15-1Jkzy7iY52/45W89Lc9fRyB0Gh8\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 2581,
		"path": "../public/assets/switch-CsWpWmEF.js"
	},
	"/assets/useMatch-C6_immir.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a7-YjitFVmMc76fXHiJultqogYRzhM\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 679,
		"path": "../public/assets/useMatch-C6_immir.js"
	},
	"/assets/useServerFn-Bcpupx8s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"198-Q1oMfkwuHHNPVn0pcc3+leDsICU\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 408,
		"path": "../public/assets/useServerFn-Bcpupx8s.js"
	},
	"/assets/x-BAkLoUi6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-yS8iuHj3qLiy38QM+B2Iw3PbOg8\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 154,
		"path": "../public/assets/x-BAkLoUi6.js"
	},
	"/assets/use-current-user-DnX8HZg5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"256-+jzwjxKXfwoZqj5lYQTfTM5YjAs\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 598,
		"path": "../public/assets/use-current-user-DnX8HZg5.js"
	},
	"/assets/useQuery-TbHI8h-O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2253-ZQwhk+j05UimIjAXghtwWR+R/9Q\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 8787,
		"path": "../public/assets/useQuery-TbHI8h-O.js"
	},
	"/assets/useRouter-BK9d_kIg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cb-G08nRlPSTsUsIDiJ/I9aE/+Lvmo\"",
		"mtime": "2026-09-10T20:49:48.015Z",
		"size": 203,
		"path": "../public/assets/useRouter-BK9d_kIg.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_j21Qvj = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_j21Qvj
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
var tracingSrvxPlugins = [];
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };

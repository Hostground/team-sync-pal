//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-DRevay3j.js
var manifest = {
	"166516be86d18b97f9b78b2ce5d074ed5646bd45fdcbcc76417838fd4edc2df9": {
		functionName: "getActivityOverview_createServerFn_handler",
		importer: () => import("./_ssr/planning.functions-D64G-oou.mjs")
	},
	"28a7fbcc068b333fec1855d01ae63a2099e64de3ecd9a11b9b67ae07abc7e7bd": {
		functionName: "markNotificationRead_createServerFn_handler",
		importer: () => import("./_ssr/planning.functions-D64G-oou.mjs")
	},
	"39f57ee9241ba496c109d1e53613c35321ae2c58e0dda7ad04e6bb8a93eff46c": {
		functionName: "getTurnstileConfig_createServerFn_handler",
		importer: () => import("./_ssr/turnstile.functions-SmKh3XNK.mjs")
	},
	"6a55148ad597e82751c0bfa671caee282e281f6055ae424602d144fb40d769cb": {
		functionName: "getDisplayByCode_createServerFn_handler",
		importer: () => import("./_ssr/display.functions-Ci-jZ2XV.mjs")
	},
	"7a10f1ed045ea88fca9f8b30418e0e30bde7218c84f3fbd738156830fa8e6d94": {
		functionName: "adminSetRole_createServerFn_handler",
		importer: () => import("./_ssr/planning.functions-D64G-oou.mjs")
	},
	"9b48145969970738413bd88ce1ea4e0bf97593f6e78997f8b12e29d04125a7f6": {
		functionName: "completeActivity_createServerFn_handler",
		importer: () => import("./_ssr/planning.functions-D64G-oou.mjs")
	},
	"9b544b945d389952b928474ca53ab24b7d82def9c74a1d48ac98ab6510bb3d28": {
		functionName: "adminCreateUser_createServerFn_handler",
		importer: () => import("./_ssr/planning.functions-D64G-oou.mjs")
	},
	"9bef081177ea575fa2cb4b6bdc094559f290842d5d0862e9e8a68adb12f88082": {
		functionName: "registerActivityPhoto_createServerFn_handler",
		importer: () => import("./_ssr/photos.functions-P-ptPZ1Y.mjs")
	},
	"aac4d5e1921009ac4c646d43b1426f1d83e7581e42acbe08ae77ed71491c7db1": {
		functionName: "createActivity_createServerFn_handler",
		importer: () => import("./_ssr/planning.functions-D64G-oou.mjs")
	},
	"b7677cd206e3c0391100ea729e605bc3e5ec730eaaa7357d6c47df2aaf4df1c9": {
		functionName: "createPhotoUploadUrl_createServerFn_handler",
		importer: () => import("./_ssr/photos.functions-P-ptPZ1Y.mjs")
	},
	"bc70dd02ed06fbbaebb18f3acdfa910a37fa00062ea8ab5cef7aaf4c0ec22d45": {
		functionName: "verifyTurnstile_createServerFn_handler",
		importer: () => import("./_ssr/turnstile.functions-SmKh3XNK.mjs")
	},
	"be20f9a7c808a8be18233cc4217b7bfb271582fcf74c2bd07a81f1a30236858c": {
		functionName: "listActivityPhotos_createServerFn_handler",
		importer: () => import("./_ssr/photos.functions-P-ptPZ1Y.mjs")
	},
	"c2058d95d092ebde5e39f45a68c13e093dd73b3db2cbf898923aad9db341e426": {
		functionName: "respondActivity_createServerFn_handler",
		importer: () => import("./_ssr/planning.functions-D64G-oou.mjs")
	},
	"d2ea4b24fe91249f2724b848b42c8570ee8f74aa91af6f5f2cc9ccb88c941c57": {
		functionName: "getActivityAuditLog_createServerFn_handler",
		importer: () => import("./_ssr/planning.functions-D64G-oou.mjs")
	},
	"de88b8ced65b2b060429531ad6b9d53670d3d2d9e07e392ff1fe4b4d591673fd": {
		functionName: "deleteActivityPhoto_createServerFn_handler",
		importer: () => import("./_ssr/photos.functions-P-ptPZ1Y.mjs")
	},
	"e104f916f69c76500b6b2dd7da8c623140dfbd556fa787fc8aad014781b01053": {
		functionName: "setActivityLocation_createServerFn_handler",
		importer: () => import("./_ssr/planning.functions-D64G-oou.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };

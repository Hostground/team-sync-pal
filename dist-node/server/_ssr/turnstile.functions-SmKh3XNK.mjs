import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { a as stringType, i as objectType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/turnstile.functions-SmKh3XNK.js
/**
* Cloudflare Turnstile.
* Zolang TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY niet zijn ingesteld,
* blijft de bot-check uit en werkt aanmelden/registreren gewoon.
*/
var getTurnstileConfig_createServerFn_handler = createServerRpc({
	id: "39f57ee9241ba496c109d1e53613c35321ae2c58e0dda7ad04e6bb8a93eff46c",
	name: "getTurnstileConfig",
	filename: "src/lib/turnstile.functions.ts"
}, (opts) => getTurnstileConfig.__executeServer(opts));
var getTurnstileConfig = createServerFn({ method: "GET" }).handler(getTurnstileConfig_createServerFn_handler, async () => {
	const siteKey = process.env["TURNSTILE_SITE_KEY"] ?? "";
	const secret = process.env["TURNSTILE_SECRET_KEY"] ?? "";
	return {
		siteKey,
		enabled: Boolean(siteKey && secret)
	};
});
var verifyTurnstile_createServerFn_handler = createServerRpc({
	id: "bc70dd02ed06fbbaebb18f3acdfa910a37fa00062ea8ab5cef7aaf4c0ec22d45",
	name: "verifyTurnstile",
	filename: "src/lib/turnstile.functions.ts"
}, (opts) => verifyTurnstile.__executeServer(opts));
var verifyTurnstile = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	token: stringType().max(4096),
	action: stringType().max(64).optional()
}).parse(input)).handler(verifyTurnstile_createServerFn_handler, async ({ data }) => {
	const secret = process.env["TURNSTILE_SECRET_KEY"] ?? "";
	if (!secret) return {
		ok: true,
		skipped: true
	};
	if (!data.token) return {
		ok: false,
		error: "Bot-verificatie ontbreekt"
	};
	try {
		const body = await (await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			method: "POST",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				secret,
				response: data.token
			})
		})).json();
		if (!body.success) {
			console.error("[turnstile] verificatie mislukt", body["error-codes"]);
			return {
				ok: false,
				error: "Bot-verificatie mislukt, probeer opnieuw"
			};
		}
		return {
			ok: true,
			skipped: false
		};
	} catch (e) {
		console.error("[turnstile] siteverify onbereikbaar", e);
		return {
			ok: false,
			error: "Bot-verificatie tijdelijk niet beschikbaar"
		};
	}
});
//#endregion
export { getTurnstileConfig_createServerFn_handler, verifyTurnstile_createServerFn_handler };

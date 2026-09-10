import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-aEi6Dc2K.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { I as CalendarCheck2 } from "../_libs/lucide-react.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createSsrRpc } from "./createSsrRpc-8YnnUnRy.mjs";
import { a as stringType, i as objectType } from "../_libs/zod.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { t as createLovableAuth } from "../_libs/lovable.dev__cloud-auth-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-yju0g3W2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Cloudflare Turnstile.
* Zolang TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY niet zijn ingesteld,
* blijft de bot-check uit en werkt aanmelden/registreren gewoon.
*/
var getTurnstileConfig = createServerFn({ method: "GET" }).handler(createSsrRpc("39f57ee9241ba496c109d1e53613c35321ae2c58e0dda7ad04e6bb8a93eff46c"));
var verifyTurnstile = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	token: stringType().max(4096),
	action: stringType().max(64).optional()
}).parse(input)).handler(createSsrRpc("bc70dd02ed06fbbaebb18f3acdfa910a37fa00062ea8ab5cef7aaf4c0ec22d45"));
var SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
function loadScript() {
	if (typeof window === "undefined") return Promise.resolve();
	if (window.turnstile) return Promise.resolve();
	const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
	if (existing) return new Promise((resolve) => existing.addEventListener("load", () => resolve(), { once: true }));
	return new Promise((resolve) => {
		const s = document.createElement("script");
		s.src = SCRIPT_SRC;
		s.async = true;
		s.defer = true;
		s.addEventListener("load", () => resolve(), { once: true });
		document.head.appendChild(s);
	});
}
function TurnstileWidget({ siteKey, action, onToken, resetKey = 0 }) {
	const ref = (0, import_react.useRef)(null);
	const widgetId = (0, import_react.useRef)(null);
	const cb = (0, import_react.useRef)(onToken);
	cb.current = onToken;
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		loadScript().then(() => {
			if (cancelled || !ref.current || !window.turnstile) return;
			ref.current.innerHTML = "";
			widgetId.current = window.turnstile.render(ref.current, {
				sitekey: siteKey,
				action,
				callback: (token) => cb.current(token),
				"expired-callback": () => cb.current(""),
				"error-callback": () => cb.current(""),
				theme: "auto",
				size: "flexible"
			});
		});
		return () => {
			cancelled = true;
			if (widgetId.current && window.turnstile) {
				try {
					window.turnstile.remove(widgetId.current);
				} catch {}
				widgetId.current = null;
			}
		};
	}, [
		siteKey,
		action,
		resetKey
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: "mt-3 flex justify-center"
	});
}
var lovableAuth = createLovableAuth();
var lovable = { auth: { signInWithOAuth: async (provider, opts) => {
	const result = await lovableAuth.signInWithOAuth(provider, {
		redirect_uri: opts?.redirect_uri,
		extraParams: { ...opts?.extraParams }
	});
	if (result.redirected) return result;
	if (result.error) return result;
	try {
		await supabase.auth.setSession(result.tokens);
	} catch (e) {
		return { error: e instanceof Error ? e : new Error(String(e)) };
	}
	return result;
} } };
function AuthPage() {
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [captchaToken, setCaptchaToken] = (0, import_react.useState)("");
	const [captchaNonce, setCaptchaNonce] = (0, import_react.useState)(0);
	const verifyCaptcha = useServerFn(verifyTurnstile);
	const { data: turnstile } = useQuery({
		queryKey: ["turnstile-config"],
		queryFn: () => getTurnstileConfig(),
		staleTime: Infinity
	});
	const captchaOn = Boolean(turnstile?.enabled && turnstile.siteKey);
	/** Valideert de Turnstile-token server-side. Geeft false bij afkeuring. */
	const passCaptcha = async (action) => {
		if (!captchaOn) return true;
		if (!captchaToken) {
			toast.error("Bevestig eerst de bot-controle");
			return false;
		}
		const res = await verifyCaptcha({ data: {
			token: captchaToken,
			action
		} });
		if (!res.ok) {
			toast.error(res.error ?? "Bot-verificatie mislukt");
			setCaptchaToken("");
			setCaptchaNonce((n) => n + 1);
			return false;
		}
		return true;
	};
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) navigate({ to: "/planning" });
		});
	}, [navigate]);
	const handleSignIn = async (e) => {
		e.preventDefault();
		setLoading(true);
		if (!await passCaptcha("signin")) {
			setLoading(false);
			return;
		}
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});
		setLoading(false);
		if (captchaOn) {
			setCaptchaToken("");
			setCaptchaNonce((n) => n + 1);
		}
		if (error) return toast.error(error.message);
		toast.success("Ingelogd");
		navigate({ to: "/planning" });
	};
	const handleSignUp = async (e) => {
		e.preventDefault();
		setLoading(true);
		if (!await passCaptcha("signup")) {
			setLoading(false);
			return;
		}
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${window.location.origin}/planning`,
				data: { full_name: fullName }
			}
		});
		setLoading(false);
		if (captchaOn) {
			setCaptchaToken("");
			setCaptchaNonce((n) => n + 1);
		}
		if (error) return toast.error(error.message);
		toast.success("Account aangemaakt — je bent ingelogd");
		navigate({ to: "/planning" });
	};
	const handleGoogle = async () => {
		setLoading(true);
		const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
		if (result.error) {
			setLoading(false);
			toast.error("Google login mislukt");
			return;
		}
		if (result.redirected) return;
		navigate({ to: "/planning" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-muted/30 flex items-center justify-center p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "w-full max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCheck2, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Planning" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Log in of maak een account aan" })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					defaultValue: "signin",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							className: "grid w-full grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "signin",
								children: "Inloggen"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "signup",
								children: "Registreren"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "signin",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: handleSignIn,
								className: "space-y-3 mt-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "in-email",
										children: "E-mail"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "in-email",
										type: "email",
										required: true,
										value: email,
										onChange: (e) => setEmail(e.target.value)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "in-pass",
										children: "Wachtwoord"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "in-pass",
										type: "password",
										required: true,
										value: password,
										onChange: (e) => setPassword(e.target.value)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										className: "w-full",
										disabled: loading,
										children: "Inloggen"
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "signup",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: handleSignUp,
								className: "space-y-3 mt-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "up-name",
										children: "Volledige naam"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "up-name",
										required: true,
										value: fullName,
										onChange: (e) => setFullName(e.target.value)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "up-email",
										children: "E-mail"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "up-email",
										type: "email",
										required: true,
										value: email,
										onChange: (e) => setEmail(e.target.value)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "up-pass",
										children: "Wachtwoord"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "up-pass",
										type: "password",
										required: true,
										minLength: 6,
										value: password,
										onChange: (e) => setPassword(e.target.value)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										className: "w-full",
										disabled: loading,
										children: "Account aanmaken"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground text-center",
										children: "De eerste geregistreerde gebruiker wordt automatisch beheerder."
									})
								]
							})
						})
					]
				}),
				captchaOn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TurnstileWidget, {
					siteKey: turnstile.siteKey,
					onToken: setCaptchaToken,
					resetKey: captchaNonce
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative my-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 flex items-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-full border-t" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative flex justify-center text-xs uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "bg-card px-2 text-muted-foreground",
							children: "of"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "w-full",
					onClick: handleGoogle,
					disabled: loading,
					children: "Inloggen met Google"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-center text-xs text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "underline",
						children: "Terug naar start"
					})
				})
			] })]
		})
	});
}
//#endregion
export { AuthPage as component };

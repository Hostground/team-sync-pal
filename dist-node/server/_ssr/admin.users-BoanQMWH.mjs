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
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { n as adminSetRole, t as adminCreateUser } from "./planning.functions-BuySTUZv.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.users-BoanQMWH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function UsersAdmin() {
	const qc = useQueryClient();
	const createUser = useServerFn(adminCreateUser);
	const setRole = useServerFn(adminSetRole);
	const [form, setForm] = (0, import_react.useState)({
		email: "",
		full_name: "",
		password: "",
		role: "employee"
	});
	const { data: users = [] } = useQuery({
		queryKey: ["admin-users"],
		queryFn: async () => {
			const { data: profs } = await supabase.from("profiles").select("*").order("full_name");
			const { data: roles } = await supabase.from("user_roles").select("*");
			const roleMap = /* @__PURE__ */ new Map();
			(roles ?? []).forEach((r) => {
				const cur = roleMap.get(r.user_id);
				const rank = (x) => x === "admin" ? 3 : x === "management" ? 2 : 1;
				if (!cur || rank(r.role) > rank(cur)) roleMap.set(r.user_id, r.role);
			});
			return (profs ?? []).map((p) => ({
				...p,
				role: roleMap.get(p.id) ?? "employee"
			}));
		}
	});
	const submit = async (e) => {
		e.preventDefault();
		try {
			await createUser({ data: form });
			toast.success("Gebruiker aangemaakt");
			setForm({
				email: "",
				full_name: "",
				password: "",
				role: "employee"
			});
			qc.invalidateQueries({ queryKey: ["admin-users"] });
		} catch (e) {
			toast.error(e.message);
		}
	};
	const changeRole = async (user_id, role) => {
		try {
			await setRole({ data: {
				user_id,
				role
			} });
			qc.invalidateQueries({ queryKey: ["admin-users"] });
		} catch (e) {
			toast.error(e.message);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl mx-auto space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: "Gebruikers"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Nieuwe gebruiker"
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "grid gap-3 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Naam" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						required: true,
						value: form.full_name,
						onChange: (e) => setForm({
							...form,
							full_name: e.target.value
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "E-mail" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "email",
						required: true,
						value: form.email,
						onChange: (e) => setForm({
							...form,
							email: e.target.value
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Wachtwoord" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						required: true,
						minLength: 8,
						value: form.password,
						onChange: (e) => setForm({
							...form,
							password: e.target.value
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Rol" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.role,
						onValueChange: (v) => setForm({
							...form,
							role: v
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "employee",
								children: "Medewerker"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "management",
								children: "Management"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "admin",
								children: "Beheerder"
							})
						] })]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "md:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Aanmaken"
						})
					})
				]
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: users.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "py-3 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: u.full_name ?? u.email
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: u.email
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: u.role,
						onValueChange: (v) => changeRole(u.id, v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-40",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "employee",
								children: "Medewerker"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "management",
								children: "Management"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "admin",
								children: "Beheerder"
							})
						] })]
					})]
				}) }, u.id))
			})
		]
	});
}
//#endregion
export { UsersAdmin as component };

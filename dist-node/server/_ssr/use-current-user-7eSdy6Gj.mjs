import { t as supabase } from "./client-aEi6Dc2K.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-current-user-7eSdy6Gj.js
function useCurrentUser() {
	return useQuery({
		queryKey: ["current-user"],
		queryFn: async () => {
			const { data: userData } = await supabase.auth.getUser();
			if (!userData.user) return null;
			const [{ data: profile }, { data: roles }] = await Promise.all([supabase.from("profiles").select("*").eq("id", userData.user.id).maybeSingle(), supabase.from("user_roles").select("role").eq("user_id", userData.user.id)]);
			const roleList = (roles ?? []).map((r) => r.role);
			const role = roleList.includes("admin") ? "admin" : roleList.includes("management") ? "management" : "employee";
			return {
				user: userData.user,
				profile,
				roles: roleList,
				role
			};
		},
		staleTime: 3e4
	});
}
var isStaff = (role) => role === "admin" || role === "management";
//#endregion
export { useCurrentUser as n, isStaff as t };

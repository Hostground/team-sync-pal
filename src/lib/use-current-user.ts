import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "management" | "employee";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userData.user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userData.user.id),
      ]);
      const roleList = (roles ?? []).map((r: { role: AppRole }) => r.role);
      const role: AppRole = roleList.includes("admin")
        ? "admin"
        : roleList.includes("management")
          ? "management"
          : "employee";
      return {
        user: userData.user,
        profile: profile as {
          id: string;
          email: string;
          full_name: string | null;
          notif_email: boolean;
          notif_push: boolean;
          notif_inapp: boolean;
        } | null,
        roles: roleList,
        role,
      };
    },
    staleTime: 30_000,
  });
}

export const isStaff = (role: AppRole | undefined) =>
  role === "admin" || role === "management";

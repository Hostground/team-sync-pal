import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { adminCreateUser, adminSetRole } from "@/lib/planning.functions";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersAdmin,
});

function UsersAdmin() {
  const qc = useQueryClient();
  const createUser = useServerFn(adminCreateUser);
  const setRole = useServerFn(adminSetRole);
  const [form, setForm] = useState({ email: "", full_name: "", password: "", role: "employee" as "admin" | "management" | "employee" });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profs } = await supabase.from("profiles").select("*").order("full_name");
      const { data: roles } = await supabase.from("user_roles").select("*");
      const roleMap = new Map<string, string>();
      (roles ?? []).forEach((r: any) => {
        const cur = roleMap.get(r.user_id);
        const rank = (x: string) => (x === "admin" ? 3 : x === "management" ? 2 : 1);
        if (!cur || rank(r.role) > rank(cur)) roleMap.set(r.user_id, r.role);
      });
      return (profs ?? []).map((p: any) => ({ ...p, role: roleMap.get(p.id) ?? "employee" }));
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({ data: form });
      toast.success("Gebruiker aangemaakt");
      setForm({ email: "", full_name: "", password: "", role: "employee" });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const changeRole = async (user_id: string, role: any) => {
    try {
      await setRole({ data: { user_id, role } });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Gebruikers</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Nieuwe gebruiker</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
            <div><Label>Naam</Label><Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><Label>E-mail</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Wachtwoord</Label><Input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div>
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={(v: any) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Medewerker</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="admin">Beheerder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2"><Button type="submit">Aanmaken</Button></div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {users.map((u: any) => (
          <Card key={u.id}>
            <CardContent className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{u.full_name ?? u.email}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <Select value={u.role} onValueChange={(v) => changeRole(u.id, v)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Medewerker</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="admin">Beheerder</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

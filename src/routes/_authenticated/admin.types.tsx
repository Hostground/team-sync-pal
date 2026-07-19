import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/types")({
  component: TypesAdmin,
});

function TypesAdmin() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", color: "#3b82f6" });

  const { data: types = [] } = useQuery({
    queryKey: ["types-admin"],
    queryFn: async () => (await supabase.from("activity_types").select("*").order("name")).data ?? [],
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("activity_types").insert({
      name: form.name,
      color: form.color,
    });
    if (error) return toast.error(error.message);
    setForm({ name: "", color: "#3b82f6" });
    qc.invalidateQueries({ queryKey: ["types-admin"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Verwijderen?")) return;
    await supabase.from("activity_types").update({ active: false }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["types-admin"] });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Activiteitstypes</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Nieuw type</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex gap-3 items-end">
            <div className="flex-1"><Label>Naam</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Kleur</Label><Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
            <Button type="submit">Toevoegen</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {types.filter((t: any) => t.active).map((t: any) => (
          <Card key={t.id}>
            <CardContent className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: t.color }} />
                <span>{t.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(t.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

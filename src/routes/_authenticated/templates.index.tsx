import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/templates/")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    title: "",
    type_id: "",
    location: "",
    description: "",
    duration_minutes: 60,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: async () =>
      (await supabase.from("activity_templates").select("*, activity_types(name)").order("name")).data ?? [],
  });
  const { data: types = [] } = useQuery({
    queryKey: ["types"],
    queryFn: async () => (await supabase.from("activity_types").select("*").eq("active", true)).data ?? [],
  });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("activity_templates").insert({
      name: form.name,
      title: form.title,
      type_id: form.type_id || null,
      location: form.location || null,
      description: form.description || null,
      duration_minutes: form.duration_minutes,
      created_by: u.user!.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Sjabloon aangemaakt");
    setForm({ name: "", title: "", type_id: "", location: "", description: "", duration_minutes: 60 });
    qc.invalidateQueries({ queryKey: ["templates"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Sjabloon verwijderen?")) return;
    await supabase.from("activity_templates").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["templates"] });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Sjablonen</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nieuw sjabloon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Naam *</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Titel activiteit *</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type_id} onValueChange={(v) => setForm({ ...form, type_id: v })}>
                <SelectTrigger><SelectValue placeholder="Kies…" /></SelectTrigger>
                <SelectContent>
                  {types.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duur (minuten)</Label>
              <Input type="number" min={15} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
            </div>
            <div className="md:col-span-2">
              <Label>Locatie</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Omschrijving</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Aanmaken</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {templates.map((t: any) => (
          <Card key={t.id}>
            <CardContent className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.title} · {t.activity_types?.name ?? "Geen type"} · {t.duration_minutes} min
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(t.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="pt-4 text-xl font-bold">Checklist-sjablonen</h2>
      <ChecklistTemplatesManager />
    </div>

  );
}

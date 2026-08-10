import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ListChecks, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ChecklistTemplatesManager() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [tasks, setTasks] = useState("");

  const { data: templates = [] } = useQuery({
    queryKey: ["checklist-templates"],
    queryFn: async () =>
      (
        await supabase
          .from("checklist_templates")
          .select("id,name,checklist_template_items(id,title,position)")
          .order("name")
      ).data ?? [],
  });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const titles = tasks
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!name.trim() || titles.length === 0) return toast.error("Naam en minstens één taak zijn nodig");
    const { data: u } = await supabase.auth.getUser();
    const { data: tpl, error } = await supabase
      .from("checklist_templates")
      .insert({ name: name.trim(), created_by: u.user!.id })
      .select("id")
      .single();
    if (error || !tpl) return toast.error(error?.message ?? "Aanmaken mislukt");
    const { error: e2 } = await supabase
      .from("checklist_template_items")
      .insert(titles.map((title, position) => ({ template_id: tpl.id, title, position })));
    if (e2) return toast.error(e2.message);
    toast.success("Checklist-sjabloon aangemaakt");
    setName("");
    setTasks("");
    qc.invalidateQueries({ queryKey: ["checklist-templates"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Checklist-sjabloon verwijderen?")) return;
    const { error } = await supabase.from("checklist_templates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["checklist-templates"] });
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-4 w-4" /> Nieuw checklist-sjabloon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="grid gap-3">
            <div>
              <Label>Naam *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Taken (één per lijn) *</Label>
              <Textarea
                rows={5}
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                placeholder={"Materiaal laden\nWerf opruimen\nFoto's nemen"}
              />
            </div>
            <div>
              <Button type="submit">Aanmaken</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {(templates as any[]).map((t) => (
        <Card key={t.id}>
          <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 py-3">
            <div className="min-w-0">
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">
                {(t.checklist_template_items ?? [])
                  .slice()
                  .sort((a: any, b: any) => a.position - b.position)
                  .map((i: any) => i.title)
                  .join(" · ")}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => remove(t.id)} aria-label="Verwijderen">
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { createActivity } from "@/lib/planning.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/planning/new")({
  component: NewActivity,
});

function NewActivity() {
  const navigate = useNavigate();
  const submit = useServerFn(createActivity);

  const { data: types = [] } = useQuery({
    queryKey: ["types"],
    queryFn: async () => (await supabase.from("activity_types").select("*").eq("active", true)).data ?? [],
  });
  const { data: employees = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => (await supabase.from("profiles").select("id,full_name,email").eq("active", true).order("full_name")).data ?? [],
  });
  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => (await supabase.from("activity_templates").select("*").order("name")).data ?? [],
  });

  const [form, setForm] = useState({
    title: "",
    type_id: "",
    assignee_id: "",
    start_at: "",
    end_at: "",
    location: "",
    description: "",
    response_window_hours: 24,
    is_rolling: false,
    save_as_template: false,
    template_name: "",
  });
  const [loading, setLoading] = useState(false);

  const applyTemplate = (id: string) => {
    const t: any = templates.find((x: any) => x.id === id);
    if (!t) return;
    setForm((f) => ({
      ...f,
      title: t.title,
      type_id: t.type_id ?? "",
      location: t.location ?? "",
      description: t.description ?? "",
    }));
    toast.success(`Sjabloon "${t.name}" geladen`);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assignee_id || !form.start_at || !form.end_at) {
      return toast.error("Vul medewerker en tijden in");
    }
    setLoading(true);
    try {
      await submit({
        data: {
          title: form.title,
          type_id: form.type_id || null,
          assignee_id: form.assignee_id,
          start_at: new Date(form.start_at).toISOString(),
          end_at: new Date(form.end_at).toISOString(),
          location: form.location || null,
          description: form.description || null,
          response_window_hours: form.response_window_hours,
          is_rolling: form.is_rolling,
        },
      });
      if (form.save_as_template && form.template_name.trim()) {
        const { data: u } = await supabase.auth.getUser();
        await supabase.from("activity_templates").insert({
          name: form.template_name,
          type_id: form.type_id || null,
          title: form.title,
          location: form.location || null,
          description: form.description || null,
          duration_minutes: 60,
          created_by: u.user!.id,
        });
      }
      toast.success("Activiteit aangemaakt");
      navigate({ to: "/planning" });
    } catch (err: any) {
      toast.error(err.message ?? "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link to="/planning" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Terug
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Nieuwe activiteit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {templates.length > 0 && (
              <div>
                <Label>Sjabloon (optioneel)</Label>
                <Select onValueChange={applyTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kies sjabloon…" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.type_id} onValueChange={(v) => setForm({ ...form, type_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kies…" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Medewerker *</Label>
                <Select value={form.assignee_id} onValueChange={(v) => setForm({ ...form, assignee_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kies…" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name ?? u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start">Start *</Label>
                <Input id="start" type="datetime-local" required value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="end">Eind *</Label>
                <Input id="end" type="datetime-local" required value={form.end_at} onChange={(e) => setForm({ ...form, end_at: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="loc">Locatie</Label>
              <Input id="loc" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="desc">Omschrijving</Label>
              <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="window">Bevestigingstermijn (uren)</Label>
              <Input
                id="window"
                type="number"
                min={1}
                max={720}
                value={form.response_window_hours}
                onChange={(e) => setForm({ ...form, response_window_hours: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">Zonder reactie → automatisch geweigerd.</p>
            </div>
            <div className="border-t pt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.save_as_template}
                  onChange={(e) => setForm({ ...form, save_as_template: e.target.checked })}
                />
                Opslaan als sjabloon voor volgende keer
              </label>
              {form.save_as_template && (
                <Input
                  placeholder="Naam van sjabloon"
                  value={form.template_name}
                  onChange={(e) => setForm({ ...form, template_name: e.target.value })}
                />
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Bezig…" : "Activiteit aanmaken"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

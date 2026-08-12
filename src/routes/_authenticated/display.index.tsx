import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser, isStaff } from "@/lib/use-current-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Copy,
  ExternalLink,
  ImagePlus,
  Monitor,
  Plus,
  RefreshCw,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/display/")({
  head: () => ({
    meta: [
      { title: "Infoscherm beheren — Planning" },
      { name: "description", content: "Beheer de lobby-TV: templates, slides, foto's, tekst en klokweergave." },
      { property: "og:title", content: "Infoscherm beheren — Planning" },
      { property: "og:description", content: "Beheer de lobby-TV: templates, slides, foto's, tekst en klokweergave." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DisplayAdminPage,
});

const randomCode = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 24);
};

const slideKinds = [
  { value: "text", label: "Tekst" },
  { value: "photos", label: "Foto's + tekst" },
  { value: "planning_today", label: "Planning vandaag" },
];

function DisplayAdminPage() {
  const { data: me } = useCurrentUser();
  const qc = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const { data: templates = [] } = useQuery({
    queryKey: ["display-templates"],
    queryFn: async () => (await supabase.from("display_templates").select("*").order("name")).data ?? [],
  });
  const { data: displays = [] } = useQuery({
    queryKey: ["displays"],
    queryFn: async () => (await supabase.from("displays").select("*").order("name")).data ?? [],
  });
  const activeTemplate = selectedTemplate || templates[0]?.id || "";
  const { data: slides = [] } = useQuery({
    queryKey: ["display-slides", activeTemplate],
    enabled: !!activeTemplate,
    queryFn: async () =>
      (await supabase.from("display_slides").select("*").eq("template_id", activeTemplate).order("position"))
        .data ?? [],
  });

  if (!isStaff(me?.role)) {
    return <p className="text-muted-foreground">Geen toegang.</p>;
  }

  const refetchAll = () => {
    qc.invalidateQueries({ queryKey: ["display-templates"] });
    qc.invalidateQueries({ queryKey: ["displays"] });
    qc.invalidateQueries({ queryKey: ["display-slides"] });
  };

  /* ---------- templates ---------- */
  const addTemplate = async () => {
    const { error } = await supabase
      .from("display_templates")
      .insert({ name: "Nieuw template", created_by: me!.user.id });
    if (error) return toast.error(error.message);
    refetchAll();
  };

  const updateTemplate = async (id: string, patch: any) => {
    const { error } = await supabase.from("display_templates").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["display-templates"] });
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase.from("display_templates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (activeTemplate === id) setSelectedTemplate("");
    refetchAll();
  };

  /* ---------- slides ---------- */
  const addSlide = async (kind: string) => {
    if (!activeTemplate) return toast.error("Maak eerst een template aan");
    const { error } = await supabase.from("display_slides").insert({
      template_id: activeTemplate,
      kind,
      position: slides.length,
      title: kind === "planning_today" ? "Vandaag" : "Nieuwe slide",
    });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["display-slides", activeTemplate] });
  };

  const updateSlide = async (id: string, patch: any) => {
    const { error } = await supabase.from("display_slides").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["display-slides", activeTemplate] });
  };

  const deleteSlide = async (id: string) => {
    const { error } = await supabase.from("display_slides").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["display-slides", activeTemplate] });
  };

  const moveSlide = async (index: number, dir: -1 | 1) => {
    const a = slides[index];
    const b = slides[index + dir];
    if (!a || !b) return;
    await supabase.from("display_slides").update({ position: b.position }).eq("id", a.id);
    await supabase.from("display_slides").update({ position: a.position }).eq("id", b.id);
    qc.invalidateQueries({ queryKey: ["display-slides", activeTemplate] });
  };

  const uploadImages = async (slideId: string, current: string[], files: FileList | null) => {
    if (!files || files.length === 0) return;
    const paths: string[] = [...current];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${activeTemplate}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("display-media").upload(path, file, {
        cacheControl: "3600",
      });
      if (error) {
        toast.error(error.message);
        continue;
      }
      paths.push(path);
    }
    await updateSlide(slideId, { media: paths });
    toast.success("Foto's toegevoegd");
  };

  const removeImage = async (slideId: string, current: string[], path: string) => {
    await supabase.storage.from("display-media").remove([path]);
    await updateSlide(slideId, { media: current.filter((p) => p !== path) });
  };

  /* ---------- displays ---------- */
  const addDisplay = async () => {
    const { error } = await supabase.from("displays").insert({
      name: "Lobby TV",
      code: randomCode(),
      template_id: activeTemplate || null,
      created_by: me!.user.id,
    });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["displays"] });
  };

  const updateDisplay = async (id: string, patch: any) => {
    const { error } = await supabase.from("displays").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["displays"] });
  };

  const deleteDisplay = async (id: string) => {
    const { error } = await supabase.from("displays").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["displays"] });
  };

  const displayUrl = (code: string) =>
    typeof window === "undefined" ? `/display/${code}` : `${window.location.origin}/display/${code}`;

  const tpl = templates.find((t) => t.id === activeTemplate);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Monitor className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">Infoscherm</h1>
      </div>

      <Tabs defaultValue="screens">
        <TabsList>
          <TabsTrigger value="screens">Schermen</TabsTrigger>
          <TabsTrigger value="templates">Templates &amp; slides</TabsTrigger>
        </TabsList>

        {/* ------------- Schermen ------------- */}
        <TabsContent value="screens" className="mt-4 space-y-4">
          <Button onClick={addDisplay}>
            <Plus className="mr-2 h-4 w-4" /> Nieuw scherm
          </Button>

          {displays.map((d) => (
            <Card key={d.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{d.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Naam</Label>
                    <Input
                      defaultValue={d.name}
                      onBlur={(e) => e.target.value !== d.name && updateDisplay(d.id, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Template</Label>
                    <Select
                      value={d.template_id ?? ""}
                      onValueChange={(v) => updateDisplay(d.id, { template_id: v || null })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kies template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <code className="max-w-full truncate rounded bg-muted px-2 py-1 text-xs">
                    {displayUrl(d.code)}
                  </code>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(displayUrl(d.code));
                      toast.success("Link gekopieerd");
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Kopieer link
                  </Button>
                  <Button size="sm" variant="secondary" asChild>
                    <a href={`/display/${d.code}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Open op TV
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateDisplay(d.id, { code: randomCode() })}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Nieuwe code
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={d.active}
                      onCheckedChange={(v) => updateDisplay(d.id, { active: v })}
                      id={`act-${d.id}`}
                    />
                    <Label htmlFor={`act-${d.id}`}>Actief</Label>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteDisplay(d.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {displays.length === 0 && (
            <p className="text-sm text-muted-foreground">Nog geen schermen aangemaakt.</p>
          )}
        </TabsContent>

        {/* ------------- Templates ------------- */}
        <TabsContent value="templates" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-48">
              <Label>Template</Label>
              <Select value={activeTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Kies template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addTemplate} variant="secondary">
              <Plus className="mr-2 h-4 w-4" /> Nieuw template
            </Button>
            {tpl && (
              <Button variant="ghost" onClick={() => deleteTemplate(tpl.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Verwijder template
              </Button>
            )}
          </div>

          {tpl && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Instellingen</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Naam</Label>
                  <Input
                    defaultValue={tpl.name}
                    key={tpl.id}
                    onBlur={(e) => e.target.value !== tpl.name && updateTemplate(tpl.id, { name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Slideduur (seconden)</Label>
                  <Input
                    type="number"
                    min={3}
                    defaultValue={tpl.default_slide_seconds}
                    key={`sec-${tpl.id}`}
                    onBlur={(e) =>
                      updateTemplate(tpl.id, { default_slide_seconds: Number(e.target.value) || 10 })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="clock"
                    checked={tpl.show_clock}
                    onCheckedChange={(v) => updateTemplate(tpl.id, { show_clock: v })}
                  />
                  <Label htmlFor="clock">Klok &amp; datum tonen</Label>
                </div>
                <div>
                  <Label>Positie klok</Label>
                  <Select
                    value={tpl.clock_position}
                    onValueChange={(v) => updateTemplate(tpl.id, { clock_position: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Links boven</SelectItem>
                      <SelectItem value="top-right">Rechts boven</SelectItem>
                      <SelectItem value="bottom-left">Links onder</SelectItem>
                      <SelectItem value="bottom-right">Rechts onder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Achtergrondkleur</Label>
                  <Input
                    type="color"
                    defaultValue={(tpl.theme as { bg?: string })?.bg ?? "#0b1220"}
                    key={`bg-${tpl.id}`}
                    onBlur={(e) =>
                      updateTemplate(tpl.id, {
                        theme: { ...(tpl.theme as object), bg: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Donkerte over foto (0–1)</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min={0}
                    max={1}
                    defaultValue={(tpl.theme as { overlay?: number })?.overlay ?? 0.35}
                    key={`ov-${tpl.id}`}
                    onBlur={(e) =>
                      updateTemplate(tpl.id, {
                        theme: { ...(tpl.theme as object), overlay: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {tpl && (
            <div className="flex flex-wrap gap-2">
              {slideKinds.map((k) => (
                <Button key={k.value} size="sm" variant="secondary" onClick={() => addSlide(k.value)}>
                  <Plus className="mr-2 h-4 w-4" /> {k.label}
                </Button>
              ))}
            </div>
          )}

          {slides.map((s, i) => {
            const media = Array.isArray(s.media) ? (s.media as string[]) : [];
            return (
              <Card key={s.id}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                  <CardTitle className="text-base">
                    {i + 1}. {slideKinds.find((k) => k.value === s.kind)?.label ?? s.kind}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => moveSlide(i, -1)} disabled={i === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => moveSlide(i, 1)}
                      disabled={i === slides.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteSlide(s.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Titel</Label>
                      <Input
                        defaultValue={s.title ?? ""}
                        onBlur={(e) => e.target.value !== s.title && updateSlide(s.id, { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Duur (sec, leeg = standaard)</Label>
                      <Input
                        type="number"
                        min={3}
                        defaultValue={s.seconds ?? ""}
                        onBlur={(e) =>
                          updateSlide(s.id, { seconds: e.target.value ? Number(e.target.value) : null })
                        }
                      />
                    </div>
                  </div>
                  {s.kind !== "planning_today" && (
                    <div>
                      <Label>Tekst</Label>
                      <Textarea
                        rows={3}
                        defaultValue={s.body ?? ""}
                        onBlur={(e) => e.target.value !== s.body && updateSlide(s.id, { body: e.target.value })}
                      />
                    </div>
                  )}

                  <div>
                    <Label>Achtergrondfoto's</Label>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {media.map((p) => (
                        <div key={p} className="flex items-center gap-1 rounded border px-2 py-1 text-xs">
                          <span className="max-w-40 truncate">{p.split("/").pop()}</span>
                          <button
                            type="button"
                            className="text-destructive"
                            onClick={() => removeImage(s.id, media, p)}
                            aria-label="Verwijder foto"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
                        <ImagePlus className="h-4 w-4" /> Foto's toevoegen
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => uploadImages(s.id, media, e.target.files)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id={`sa-${s.id}`}
                      checked={s.active}
                      onCheckedChange={(v) => updateSlide(s.id, { active: v })}
                    />
                    <Label htmlFor={`sa-${s.id}`}>Actief</Label>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

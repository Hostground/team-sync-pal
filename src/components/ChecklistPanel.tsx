import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser, isStaff } from "@/lib/use-current-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, MoreVertical, Trash2, Pencil, ListChecks, Copy, Save, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  done_at: string | null;
  done_by: string | null;
  position: number;
  activity_id: string | null;
  owner_id: string | null;
};

type Props = {
  /** Checklist attached to an activity */
  activityId?: string;
  /** Personal checklist for the signed-in user */
  personal?: boolean;
  title?: string;
};

export function ChecklistPanel({ activityId, personal, title = "Taken" }: Props) {
  const qc = useQueryClient();
  const { data: me } = useCurrentUser();
  const userId = me?.user.id;
  const staff = isStaff(me?.role);
  const inputRef = useRef<HTMLInputElement>(null);

  const [newTitle, setNewTitle] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

  const scopeKey = activityId ? ["checklist", "activity", activityId] : ["checklist", "personal", userId];
  const enabled = activityId ? true : !!userId;

  const { data: items = [], isLoading } = useQuery({
    queryKey: scopeKey,
    enabled,
    queryFn: async () => {
      let q = supabase.from("checklist_items").select("*").order("position", { ascending: true });
      q = activityId ? q.eq("activity_id", activityId) : q.eq("owner_id", userId!);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return (data ?? []) as ChecklistItem[];
    },
  });

  // Live updates
  useEffect(() => {
    if (!enabled) return;
    const filter = activityId ? `activity_id=eq.${activityId}` : `owner_id=eq.${userId}`;
    const channel = supabase
      .channel(`checklist-${activityId ?? userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checklist_items", filter },
        () => qc.invalidateQueries({ queryKey: scopeKey }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId, userId, enabled]);

  const nextPosition = () => (items.length ? Math.max(...items.map((i) => i.position)) + 1 : 0);

  const addItem = useMutation({
    mutationFn: async (t: string) => {
      const { error } = await supabase.from("checklist_items").insert({
        title: t,
        activity_id: activityId ?? null,
        owner_id: activityId ? null : userId!,
        created_by: userId!,
        position: nextPosition(),
      });
      if (error) throw new Error(error.message);
    },
    onMutate: async (t: string) => {
      await qc.cancelQueries({ queryKey: scopeKey });
      const prev = qc.getQueryData<ChecklistItem[]>(scopeKey) ?? [];
      qc.setQueryData<ChecklistItem[]>(scopeKey, [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          title: t,
          done: false,
          done_at: null,
          done_by: null,
          position: nextPosition(),
          activity_id: activityId ?? null,
          owner_id: activityId ? null : (userId ?? null),
        },
      ]);
      return { prev };
    },
    onError: (e: Error, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(scopeKey, ctx.prev);
      toast.error(e.message);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: scopeKey }),
  });

  const toggle = useMutation({
    mutationFn: async (item: ChecklistItem) => {
      const done = !item.done;
      const { error } = await supabase
        .from("checklist_items")
        .update({ done, done_at: done ? new Date().toISOString() : null, done_by: done ? userId! : null })
        .eq("id", item.id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (item: ChecklistItem) => {
      await qc.cancelQueries({ queryKey: scopeKey });
      const prev = qc.getQueryData<ChecklistItem[]>(scopeKey) ?? [];
      qc.setQueryData<ChecklistItem[]>(
        scopeKey,
        prev.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)),
      );
      return { prev };
    },
    onError: (e: Error, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(scopeKey, ctx.prev);
      toast.error(e.message);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: scopeKey }),
  });

  const rename = useMutation({
    mutationFn: async ({ id, title: t }: { id: string; title: string }) => {
      const { error } = await supabase.from("checklist_items").update({ title: t }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: scopeKey }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("checklist_items").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: scopeKey });
      const prev = qc.getQueryData<ChecklistItem[]>(scopeKey) ?? [];
      qc.setQueryData<ChecklistItem[]>(
        scopeKey,
        prev.filter((i) => i.id !== id),
      );
      return { prev };
    },
    onError: (e: Error, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(scopeKey, ctx.prev);
      toast.error(e.message);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: scopeKey }),
  });

  // Templates
  const { data: templates = [] } = useQuery({
    queryKey: ["checklist-templates"],
    enabled: templateOpen || saveOpen,
    queryFn: async () =>
      (
        await supabase
          .from("checklist_templates")
          .select("id,name,checklist_template_items(id,title,position)")
          .order("name")
      ).data ?? [],
  });

  const { data: recentActivities = [] } = useQuery({
    queryKey: ["checklist-copy-sources"],
    enabled: copyOpen,
    queryFn: async () =>
      (
        await supabase
          .from("activities")
          .select("id,title,start_at")
          .order("start_at", { ascending: false })
          .limit(30)
      ).data ?? [],
  });

  const insertMany = async (titles: string[]) => {
    if (!titles.length) return;
    const base = nextPosition();
    const { error } = await supabase.from("checklist_items").insert(
      titles.map((t, i) => ({
        title: t,
        activity_id: activityId ?? null,
        owner_id: activityId ? null : userId!,
        created_by: userId!,
        position: base + i,
      })),
    );
    if (error) return toast.error(error.message);
    toast.success(`${titles.length} taken toegevoegd`);
    qc.invalidateQueries({ queryKey: scopeKey });
  };

  const applyTemplate = async (templateId: string) => {
    const tpl = (templates as any[]).find((t) => t.id === templateId);
    const titles = (tpl?.checklist_template_items ?? [])
      .slice()
      .sort((a: any, b: any) => a.position - b.position)
      .map((i: any) => i.title);
    setTemplateOpen(false);
    await insertMany(titles);
  };

  const copyFromActivity = async (id: string) => {
    const { data } = await supabase
      .from("checklist_items")
      .select("title,position")
      .eq("activity_id", id)
      .order("position");
    setCopyOpen(false);
    await insertMany((data ?? []).map((i) => i.title));
  };

  const saveAsTemplate = async () => {
    if (!saveName.trim()) return;
    const { data: tpl, error } = await supabase
      .from("checklist_templates")
      .insert({ name: saveName.trim(), created_by: userId! })
      .select("id")
      .single();
    if (error || !tpl) return toast.error(error?.message ?? "Opslaan mislukt");
    const { error: e2 } = await supabase.from("checklist_template_items").insert(
      items.map((i, idx) => ({ template_id: tpl.id, title: i.title, position: idx })),
    );
    if (e2) return toast.error(e2.message);
    toast.success("Bewaard als sjabloon");
    setSaveOpen(false);
    setSaveName("");
    qc.invalidateQueries({ queryKey: ["checklist-templates"] });
  };

  const open = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  const submitNew = (e: React.FormEvent) => {
    e.preventDefault();
    const t = newTitle.trim();
    if (!t) return;
    addItem.mutate(t);
    setNewTitle("");
    inputRef.current?.focus();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <CardTitle className="flex min-w-0 items-center gap-2 text-base">
            <ListChecks className="h-4 w-4 shrink-0" />
            <span className="truncate">{title}</span>
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {done.length}/{items.length} afgerond
          </span>
        </div>
        {items.length > 0 && (
          <Progress value={(done.length / items.length) * 100} className="mt-2 h-1.5" />
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={submitNew} className="flex gap-2">
          <Input
            ref={inputRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nieuwe taak…"
            className="h-11"
            enterKeyHint="done"
          />
          <Button type="submit" size="icon" className="h-11 w-11 shrink-0" aria-label="Taak toevoegen">
            <Plus className="h-5 w-5" />
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setTemplateOpen(true)}>
            <ListChecks className="mr-1 h-4 w-4" /> Sjabloon
          </Button>
          {activityId && (
            <Button variant="outline" size="sm" onClick={() => setCopyOpen(true)}>
              <Copy className="mr-1 h-4 w-4" /> Kopiëren
            </Button>
          )}
          {staff && items.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setSaveOpen(true)}>
              <Save className="mr-1 h-4 w-4" /> Bewaren
            </Button>
          )}
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Laden…</p>
        ) : items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Nog geen taken.</p>
        ) : (
          <ul className="divide-y">
            {open.map((item) => (
              <Row key={item.id} item={item} onToggle={() => toggle.mutate(item)} onRename={rename.mutate} onRemove={remove.mutate} />
            ))}
          </ul>
        )}

        {done.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowDone((v) => !v)}
              className="flex w-full items-center gap-1 py-2 text-xs text-muted-foreground"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", showDone && "rotate-180")} />
              Afgerond ({done.length})
            </button>
            {showDone && (
              <ul className="divide-y">
                {done.map((item) => (
                  <Row key={item.id} item={item} onToggle={() => toggle.mutate(item)} onRename={rename.mutate} onRemove={remove.mutate} />
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sjabloon toepassen</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {(templates as any[]).length === 0 && (
              <p className="text-sm text-muted-foreground">Nog geen checklist-sjablonen.</p>
            )}
            {(templates as any[]).map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.id)}
                className="w-full rounded-md border p-3 text-left hover:bg-accent"
              >
                <span className="font-medium">{t.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {t.checklist_template_items?.length ?? 0} taken
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={copyOpen} onOpenChange={setCopyOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kopiëren van eerdere activiteit</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {(recentActivities as any[])
              .filter((a) => a.id !== activityId)
              .map((a) => (
                <button
                  key={a.id}
                  onClick={() => copyFromActivity(a.id)}
                  className="w-full rounded-md border p-3 text-left hover:bg-accent"
                >
                  <span className="block truncate font-medium">{a.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.start_at).toLocaleDateString("nl-BE")}
                  </span>
                </button>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bewaren als sjabloon</DialogTitle>
          </DialogHeader>
          <Input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Naam van het sjabloon"
          />
          <DialogFooter>
            <Button onClick={saveAsTemplate}>Bewaren</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Row({
  item,
  onToggle,
  onRename,
  onRemove,
}: {
  item: ChecklistItem;
  onToggle: () => void;
  onRename: (v: { id: string; title: string }) => void;
  onRemove: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.title);

  if (editing) {
    return (
      <li className="flex items-center gap-2 py-2">
        <Input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-10"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onRename({ id: item.id, title: value.trim() || item.title });
              setEditing(false);
            }
            if (e.key === "Escape") setEditing(false);
          }}
        />
        <Button
          size="sm"
          onClick={() => {
            onRename({ id: item.id, title: value.trim() || item.title });
            setEditing(false);
          }}
        >
          Ok
        </Button>
      </li>
    );
  }

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-1">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-11 items-center pl-1 pr-1"
        aria-label={item.done ? "Markeer als niet afgerond" : "Markeer als afgerond"}
      >
        <Checkbox checked={item.done} className="pointer-events-none h-5 w-5" />
      </button>
      <button type="button" onClick={onToggle} className="min-h-11 min-w-0 text-left">
        <span className={cn("block text-sm", item.done && "text-muted-foreground line-through")}>
          {item.title}
        </span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" aria-label="Acties">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Hernoemen
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={() => onRemove(item.id)}>
            <Trash2 className="mr-2 h-4 w-4" /> Verwijderen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

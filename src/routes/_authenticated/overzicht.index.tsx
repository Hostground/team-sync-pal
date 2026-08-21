import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getActivityOverview } from "@/lib/planning.functions";
import { useCurrentUser, isStaff } from "@/lib/use-current-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, ChevronDown, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { PlanningCalendar } from "@/components/planning-calendar/PlanningCalendar";
import {
  type CalEvent,
  type CalendarView,
  visibleRange,
} from "@/components/planning-calendar/calendar-utils";

export const Route = createFileRoute("/_authenticated/overzicht/")({
  component: OverviewPage,
});


const statusMeta: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "In afwachting", variant: "secondary" },
  confirmed: { label: "Bevestigd", variant: "default" },
  declined: { label: "Geweigerd", variant: "destructive" },
  auto_declined: { label: "Auto-geweigerd", variant: "destructive" },
  cancelled: { label: "Geannuleerd", variant: "outline" },
  completed: { label: "Afgerond", variant: "default" },
};

const ALL = "__all__";

function OverviewPage() {
  const { data: me } = useCurrentUser();
  const fetchOverview = useServerFn(getActivityOverview);

  const [status, setStatus] = useState<string>(ALL);
  const [assigneeId, setAssigneeId] = useState<string>(ALL);
  const [typeId, setTypeId] = useState<string>(ALL);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [onlyRolling, setOnlyRolling] = useState(false);
  const [mode, setMode] = useState<"calendar" | "list">("calendar");
  const [view, setView] = useState<CalendarView>("week");
  const [anchor, setAnchor] = useState<Date>(() => new Date());


  const { data: employees = [] } = useQuery({
    queryKey: ["overview-employees"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id,full_name,email").order("full_name");
      return data ?? [];
    },
  });

  const { data: types = [] } = useQuery({
    queryKey: ["overview-types"],
    queryFn: async () => {
      const { data } = await supabase.from("activity_types").select("id,name").order("name");
      return data ?? [];
    },
  });

  const filters = useMemo(() => {
    const range =
      mode === "calendar"
        ? visibleRange(view, anchor)
        : {
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to + "T23:59:59") : undefined,
          };
    return {
      status: status !== ALL ? (status as any) : undefined,
      assignee_id: assigneeId !== ALL ? assigneeId : undefined,
      type_id: typeId !== ALL ? typeId : undefined,
      from: range.from ? range.from.toISOString() : undefined,
      to: range.to ? range.to.toISOString() : undefined,
      only_unread: onlyUnread || undefined,
      only_rolling: onlyRolling || undefined,
    };
  }, [status, assigneeId, typeId, from, to, onlyUnread, onlyRolling, mode, view, anchor]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["overview", filters],
    enabled: isStaff(me?.role),
    queryFn: () => fetchOverview({ data: filters }),
  });

  const events: CalEvent[] = useMemo(
    () =>
      (rows as any[]).map((a) => ({
        id: a.id,
        title: a.title,
        start: new Date(a.start_at),
        end: new Date(a.end_at),
        status: a.status,
        typeName: a.activity_types?.name ?? null,
        typeColor: a.activity_types?.color ?? null,
        assignee: a.assignee?.full_name ?? a.assignee?.email ?? null,
        location: a.location ?? null,
        customer: a.customer ?? null,
      })),
    [rows],
  );


  if (!me) return null;
  if (!isStaff(me.role)) {
    throw redirect({ to: "/planning" });
  }

  const reset = () => {
    setStatus(ALL);
    setAssigneeId(ALL);
    setTypeId(ALL);
    setFrom("");
    setTo("");
    setOnlyUnread(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6" /> Overzicht
        </h1>
        <p className="text-sm text-muted-foreground">
          Alle activiteiten met meldingsstatus en geschiedenis.
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-3 py-4 md:grid-cols-6">
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Alle</SelectItem>
                <SelectItem value="pending">In afwachting</SelectItem>
                <SelectItem value="confirmed">Bevestigd</SelectItem>
                <SelectItem value="declined">Geweigerd</SelectItem>
                <SelectItem value="auto_declined">Auto-geweigerd</SelectItem>
                <SelectItem value="cancelled">Geannuleerd</SelectItem>
                <SelectItem value="completed">Afgerond</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Medewerker</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Alle</SelectItem>
                {employees.map((e: any) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.full_name ?? e.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Type</Label>
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Alle</SelectItem>
                {types.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {mode === "list" && (
            <>
              <div>
                <Label className="text-xs">Van</Label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Tot</Label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </>
          )}

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={onlyUnread}
                onCheckedChange={(v) => setOnlyUnread(v === true)}
              />
              Alleen ongelezen
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={onlyRolling}
                onCheckedChange={(v) => setOnlyRolling(v === true)}
              />
              Alleen lopende
            </label>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "calendar" | "list")}>
        <TabsList>
          <TabsTrigger value="calendar">Kalender</TabsTrigger>
          <TabsTrigger value="list">Lijst</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-3">
          <PlanningCalendar
            view={view}
            anchor={anchor}
            events={events}
            isLoading={isLoading}
            onViewChange={setView}
            onAnchorChange={setAnchor}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-3 space-y-2">
      {isLoading ? (

        <p className="text-sm text-muted-foreground">Laden…</p>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Geen activiteiten gevonden.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {rows.map((a: any) => {
            const st = statusMeta[a.status] ?? statusMeta.pending;
            const notifs = (a.notifications ?? []) as any[];
            const allDeliveries = notifs.flatMap((n) => n.notification_deliveries ?? []);
            const counts = {
              inapp_unread: allDeliveries.filter((d) => d.channel === "inapp" && !d.read_at).length,
              inapp_read: allDeliveries.filter((d) => d.channel === "inapp" && d.read_at).length,
              email_sent: allDeliveries.filter((d) => d.channel === "email" && d.status === "sent").length,
              email_queued: allDeliveries.filter((d) => d.channel === "email" && d.status === "queued").length,
              push_sent: allDeliveries.filter((d) => d.channel === "push" && d.status === "sent").length,
              push_queued: allDeliveries.filter((d) => d.channel === "push" && d.status === "queued").length,
            };
            const lastAudit = (a.activity_audit_log ?? [])
              .slice()
              .sort((x: any, y: any) => (x.created_at < y.created_at ? 1 : -1))[0];

            return (
              <Card key={a.id}>
                <Collapsible>
                  <CardContent className="py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {a.activity_types?.color && (
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: a.activity_types.color }}
                            />
                          )}
                          <p className="font-medium truncate">{a.title}</p>
                          <Badge variant={st.variant} className="text-xs">{st.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(a.start_at), "d MMM yyyy HH:mm", { locale: nl })}
                          {" · "}
                          {a.assignee?.full_name ?? a.assignee?.email ?? "—"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {counts.inapp_unread > 0 && (
                          <Badge variant="secondary" className="text-xs">In-app: {counts.inapp_unread} ongelezen</Badge>
                        )}
                        {counts.inapp_read > 0 && (
                          <Badge variant="outline" className="text-xs">In-app: {counts.inapp_read} gelezen</Badge>
                        )}
                        {counts.email_sent > 0 && (
                          <Badge variant="outline" className="text-xs">E-mail: {counts.email_sent} verzonden</Badge>
                        )}
                        {counts.email_queued > 0 && (
                          <Badge variant="secondary" className="text-xs">E-mail: {counts.email_queued} wachtrij</Badge>
                        )}
                        {counts.push_sent > 0 && (
                          <Badge variant="outline" className="text-xs">Push: {counts.push_sent}</Badge>
                        )}
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/planning/$id" params={{ id: a.id }}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="mt-3 space-y-3">
                      <div>
                        <p className="text-xs font-medium mb-1">Meldingen</p>
                        {notifs.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Geen meldingen.</p>
                        ) : (
                          <div className="space-y-2">
                            {notifs.map((n: any) => (
                              <div key={n.id} className="border rounded p-2">
                                <p className="text-xs text-muted-foreground">
                                  {n.type} · {format(new Date(n.created_at), "d MMM HH:mm", { locale: nl })}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(n.notification_deliveries ?? []).map((d: any, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {d.channel}: {d.read_at ? "gelezen" : d.status}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-1">Geschiedenis</p>
                        {(a.activity_audit_log ?? []).length === 0 ? (
                          <p className="text-xs text-muted-foreground">Nog geen acties.</p>
                        ) : (
                          <div className="space-y-1">
                            {a.activity_audit_log.map((r: any) => (
                              <div key={r.id} className="text-xs border-l-2 pl-2 py-1">
                                <span className="font-medium">{r.action}</span>
                                {" · "}
                                {format(new Date(r.created_at), "d MMM HH:mm", { locale: nl })}
                                {" · "}
                                {r.actor?.full_name ?? r.actor?.email ?? "systeem"}
                                {r.note && <p className="text-muted-foreground mt-0.5">{r.note}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                        {lastAudit && (
                          <p className="text-[10px] text-muted-foreground mt-2">
                            Laatste actie: {lastAudit.action} op{" "}
                            {format(new Date(lastAudit.created_at), "d MMM HH:mm", { locale: nl })}
                          </p>
                        )}
                      </div>
                    </CollapsibleContent>
                  </CardContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
        </TabsContent>
      </Tabs>
    </div>

  );
}

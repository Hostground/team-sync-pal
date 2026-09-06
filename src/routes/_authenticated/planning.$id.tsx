import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { respondActivity, getActivityAuditLog, completeActivity, setActivityLocation } from "@/lib/planning.functions";
import { useCurrentUser, isStaff } from "@/lib/use-current-user";
import { ChecklistPanel } from "@/components/ChecklistPanel";
import { ActivityMap } from "@/components/ActivityMap";
import { ActivityPhotos, type ActivityPhoto } from "@/components/ActivityPhotos";
import { LocationPicker } from "@/components/LocationPicker";
import type { LatLng } from "@/components/map/map-constants";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronLeft, MapPin, Clock, User, FileText, Bell, Repeat, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/planning/$id")({
  component: ActivityDetail,
});

const statusMeta: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "In afwachting", variant: "secondary" },
  confirmed: { label: "Bevestigd", variant: "default" },
  declined: { label: "Geweigerd", variant: "destructive" },
  auto_declined: { label: "Auto-geweigerd", variant: "destructive" },
  cancelled: { label: "Geannuleerd", variant: "outline" },
  completed: { label: "Afgerond", variant: "default" },
};

function ActivityDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: me } = useCurrentUser();
  const respond = useServerFn(respondActivity);
  const complete = useServerFn(completeActivity);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: a, refetch } = useQuery({
    queryKey: ["activity", id],
    queryFn: async () => {
      const { data: act } = await supabase
        .from("activities")
        .select("*, activity_types(name,color)")
        .eq("id", id)
        .maybeSingle();
      if (!act) return null;
      const ids = Array.from(new Set([act.assignee_id, act.created_by]));
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,full_name,email")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      return {
        ...act,
        assignee: map.get(act.assignee_id),
        creator: map.get(act.created_by),
      } as any;
    },
  });

  const { data: deliveries = [] } = useQuery({
    queryKey: ["activity-deliveries", id],
    enabled: !!a && isStaff(me?.role),
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id,type,created_at,notification_deliveries(channel,status,sent_at,read_at)")
        .eq("activity_id", id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const fetchAudit = useServerFn(getActivityAuditLog);
  const { data: audit = [] } = useQuery({
    queryKey: ["activity-audit", id],
    enabled: !!a && isStaff(me?.role),
    queryFn: () => fetchAudit({ data: { activity_id: id } }),
  });



  if (!a) return <p className="text-sm text-muted-foreground">Laden…</p>;

  const st = statusMeta[a.status] ?? statusMeta.pending;
  const isAssignee = me?.user.id === a.assignee_id;
  const canRespond = isAssignee && a.status === "pending";
  const canComplete =
    (isAssignee || isStaff(me?.role)) &&
    !["completed", "cancelled"].includes(a.status);

  const handle = async (action: "confirm" | "decline") => {
    setLoading(true);
    try {
      await respond({ data: { activity_id: id, action, note: note || undefined } });
      toast.success(action === "confirm" ? "Bevestigd" : "Geweigerd");
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await complete({ data: { activity_id: id } });
      toast.success("Activiteit afgerond");
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <button
        onClick={() => navigate({ to: "/planning" })}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Terug
      </button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                {a.activity_types?.color && (
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: a.activity_types.color }}
                  />
                )}
                {a.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{a.activity_types?.name ?? "Geen type"}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant={st.variant}>{st.label}</Badge>
              {a.is_rolling && (
                <Badge variant="outline" className="text-xs">
                  <Repeat className="h-3 w-3 mr-1" /> Lopend
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {format(new Date(a.start_at), "EEEE d MMMM yyyy HH:mm", { locale: nl })} –{" "}
            {format(new Date(a.end_at), "HH:mm")}
          </div>
          {a.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" /> {a.location}
            </div>
          )}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Toegewezen aan {a.assignee?.full_name ?? a.assignee?.email}
          </div>
          {a.description && (
            <div className="flex gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="whitespace-pre-wrap">{a.description}</p>
            </div>
          )}
          {a.status === "pending" && (
            <p className={"text-xs " + (new Date(a.respond_by) < new Date() ? "text-destructive font-medium" : "text-muted-foreground")}>
              {new Date(a.respond_by) < new Date() ? "Verlopen — " : "Reageren voor "}
              {format(new Date(a.respond_by), "EEE d MMM HH:mm", { locale: nl })}
            </p>
          )}
          {a.is_rolling && (
            <p className="text-xs text-muted-foreground">
              Lopende activiteit — schuift automatisch door naar de volgende dag zolang ze niet
              afgerond is.
              {a.rollover_count > 0 && ` Al ${a.rollover_count}× doorgeschoven.`}
              {a.original_start_at &&
                ` Oorspronkelijk gepland op ${format(new Date(a.original_start_at), "d MMM yyyy HH:mm", { locale: nl })}.`}
            </p>
          )}
          {a.completed_at && (
            <p className="text-xs text-muted-foreground">
              Afgerond op {format(new Date(a.completed_at), "d MMM yyyy HH:mm", { locale: nl })}
            </p>
          )}

          {a.response_note && (
            <div className="rounded border p-2 bg-muted/30">
              <p className="text-xs font-medium">Reactie van medewerker</p>
              <p className="text-sm">{a.response_note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ChecklistPanel
        activityId={id}
        onAllDone={
          canComplete
            ? async () => {
                try {
                  await complete({ data: { activity_id: id, auto: true } });
                  toast.success("Alle taken klaar — activiteit afgerond");
                  refetch();
                } catch {
                  /* stil: afronden mag falen zonder de takenlijst te blokkeren */
                }
              }
            : undefined
        }
      />

      {canComplete && (
        <Button className="w-full" variant="secondary" disabled={loading} onClick={handleComplete}>
          <CheckCircle2 className="h-4 w-4 mr-1" /> Activiteit afronden
        </Button>
      )}




      {canRespond && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bevestig of weiger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Notitie (optioneel)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex gap-2">
              <Button className="flex-1" disabled={loading} onClick={() => handle("confirm")}>
                Bevestigen
              </Button>
              <Button variant="destructive" className="flex-1" disabled={loading} onClick={() => handle("decline")}>
                Weigeren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isStaff(me?.role) && deliveries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" /> Meldingsstatus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {deliveries.map((n: any) => (
              <div key={n.id} className="border-b pb-2 last:border-0">
                <p className="text-xs text-muted-foreground">
                  {n.type} · {format(new Date(n.created_at), "d MMM HH:mm", { locale: nl })}
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {n.notification_deliveries.map((d: any, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {d.channel}: {d.read_at ? "gelezen" : d.status}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isStaff(me?.role) && audit.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Geschiedenis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {audit.map((r: any) => (
              <div key={r.id} className="border-b pb-2 last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-xs">{r.action}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(r.created_at), "d MMM yyyy HH:mm", { locale: nl })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  door {r.actor?.full_name ?? r.actor?.email ?? "systeem"}
                  {r.previous_status && r.new_status && ` · ${r.previous_status} → ${r.new_status}`}
                </p>
                {r.note && <p className="text-sm mt-1 whitespace-pre-wrap">{r.note}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


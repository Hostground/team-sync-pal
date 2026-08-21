import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser, isStaff } from "@/lib/use-current-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Clock, Repeat } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/planning/")({
  component: PlanningList,
});

const statusMeta: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "In afwachting", variant: "secondary" },
  confirmed: { label: "Bevestigd", variant: "default" },
  declined: { label: "Geweigerd", variant: "destructive" },
  auto_declined: { label: "Auto-geweigerd", variant: "destructive" },
  cancelled: { label: "Geannuleerd", variant: "outline" },
  completed: { label: "Afgerond", variant: "default" },
};

function PlanningList() {
  const { data: me } = useCurrentUser();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", me?.user.id],
    enabled: !!me?.user.id,
    queryFn: async () => {
      const { data: acts } = await supabase
        .from("activities")
        .select("*, activity_types(name,color)")
        .order("start_at", { ascending: true });
      const ids = Array.from(new Set((acts ?? []).map((a) => a.assignee_id)));
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id,full_name,email").in("id", ids)
        : { data: [] as any[] };
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      return (acts ?? []).map((a) => ({ ...a, assignee: map.get(a.assignee_id) }));
    },
  });

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planning</h1>
          <p className="text-sm text-muted-foreground">
            {isStaff(me?.role) ? "Alle activiteiten" : "Jouw toegewezen activiteiten"}
          </p>
        </div>
        {isStaff(me?.role) && (
          <Button asChild>
            <Link to="/planning/new">
              <Plus className="h-4 w-4 mr-1" /> Nieuwe activiteit
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laden…</p>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nog geen activiteiten.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {activities.map((a: any) => {
            const st = statusMeta[a.status] ?? statusMeta.pending;
            return (
              <Link key={a.id} to="/planning/$id" params={{ id: a.id }}>
                <Card className="hover:border-primary transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="text-base flex items-center gap-2">
                          {a.activity_types?.color && (
                            <span
                              className="inline-block h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: a.activity_types.color }}
                            />
                          )}
                          <span className="truncate">{a.title}</span>
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {a.activity_types?.name ?? "Geen type"} ·{" "}
                          {a.assignee?.full_name ?? a.assignee?.email ?? "—"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant={st.variant}>{st.label}</Badge>
                        {a.is_rolling && (
                          <Badge variant="outline" className="text-[10px]">
                            <Repeat className="h-3 w-3 mr-1" /> Lopend
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(a.start_at), "EEE d MMM HH:mm", { locale: nl })} –{" "}
                      {format(new Date(a.end_at), "HH:mm")}
                    </span>
                    {a.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {a.location}
                      </span>
                    )}
                    {a.status === "pending" && (
                      <span className={new Date(a.respond_by) < new Date() ? "text-destructive font-medium" : ""}>
                        {new Date(a.respond_by) < new Date() ? "Verlopen — " : "Reageren voor "}
                        {format(new Date(a.respond_by), "d MMM HH:mm", { locale: nl })}
                      </span>
                    )}

                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

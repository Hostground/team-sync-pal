import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/use-current-user";
import { useServerFn } from "@tanstack/react-start";
import { markNotificationRead } from "@/lib/planning.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/notifications/")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data: me } = useCurrentUser();
  const qc = useQueryClient();
  const markRead = useServerFn(markNotificationRead);

  const { data: notifs = [] } = useQuery({
    queryKey: ["notifications", me?.user.id],
    enabled: !!me?.user.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*, notification_deliveries(channel,status,read_at,sent_at), activities(id,title)")
        .eq("user_id", me!.user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  const handleRead = async (id: string) => {
    await markRead({ data: { notification_id: id } });
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["unread-notifications"] });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Bell className="h-6 w-6" /> Meldingen
      </h1>
      {notifs.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Geen meldingen.
          </CardContent>
        </Card>
      )}
      {notifs.map((n: any) => {
        const inapp = n.notification_deliveries.find((d: any) => d.channel === "inapp");
        const unread = inapp && !inapp.read_at;
        return (
          <Card key={n.id} className={unread ? "border-primary" : ""}>
            <CardContent className="py-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{n.title}</p>
                {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: nl })}
                </p>
                {n.activity_id && (
                  <Link
                    to="/planning/$id"
                    params={{ id: n.activity_id }}
                    className="text-xs text-primary underline mt-1 inline-block"
                  >
                    Bekijk activiteit
                  </Link>
                )}
              </div>
              {unread && (
                <Button size="sm" variant="ghost" onClick={() => handleRead(n.id)}>
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

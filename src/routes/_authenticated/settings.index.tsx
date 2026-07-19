import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/use-current-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: me, refetch } = useCurrentUser();
  const qc = useQueryClient();

  const update = async (patch: { notif_inapp?: boolean; notif_email?: boolean; notif_push?: boolean }) => {
    if (!me?.user.id) return;
    const { error } = await supabase.from("profiles").update(patch).eq("id", me.user.id);
    if (error) return toast.error(error.message);
    toast.success("Opgeslagen");
    refetch();
    qc.invalidateQueries();
  };

  if (!me?.profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Instellingen</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Meldingen</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>In-app meldingen</Label>
            <Switch checked={me.profile.notif_inapp} onCheckedChange={(v) => update({ notif_inapp: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>E-mail meldingen</Label>
            <Switch checked={me.profile.notif_email} onCheckedChange={(v) => update({ notif_email: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Push meldingen</Label>
            <Switch checked={me.profile.notif_push} onCheckedChange={(v) => update({ notif_push: v })} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Account</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><span className="text-muted-foreground">Naam:</span> {me.profile.full_name}</p>
          <p><span className="text-muted-foreground">E-mail:</span> {me.profile.email}</p>
          <p><span className="text-muted-foreground">Rol:</span> {me.role}</p>
        </CardContent>
      </Card>
    </div>
  );
}

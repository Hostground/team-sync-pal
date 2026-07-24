import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import {
  CalendarDays,
  Bell,
  Settings,
  Users,
  Tags,
  FileText,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ClipboardList,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser, isStaff } from "@/lib/use-current-user";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  admin: "Beheerder",
  management: "Management",
  employee: "Medewerker",
};

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: me } = useCurrentUser();
  const qc = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Unread notifications count
  const { data: unread = 0 } = useQuery({
    queryKey: ["unread-notifications", me?.user.id],
    enabled: !!me?.user.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, notification_deliveries!inner(read_at, channel)")
        .eq("user_id", me!.user.id)
        .eq("notification_deliveries.channel", "inapp")
        .is("notification_deliveries.read_at", null);
      return data?.length ?? 0;
    },
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!me?.user.id) return;
    const ch = supabase
      .channel(`notif-${me.user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${me.user.id}` },
        () => qc.invalidateQueries({ queryKey: ["unread-notifications"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [me?.user.id, qc]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/auth" });
  };

  const nav = [
    { to: "/planning", label: "Planning", icon: CalendarDays, show: true },
    { to: "/overzicht", label: "Overzicht", icon: ClipboardList, show: isStaff(me?.role) },
    { to: "/notifications", label: "Meldingen", icon: Bell, show: true, badge: unread },

    { to: "/templates", label: "Sjablonen", icon: FileText, show: isStaff(me?.role) },
    { to: "/admin/users", label: "Gebruikers", icon: Users, show: me?.role === "admin" },
    { to: "/admin/types", label: "Activiteitstypes", icon: Tags, show: me?.role === "admin" },
    { to: "/settings", label: "Instellingen", icon: Settings, show: true },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="flex h-14 items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link to="/planning" className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>Planning</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end text-xs leading-tight">
              <span className="font-medium">{me?.profile?.full_name ?? me?.user.email}</span>
              <span className="text-muted-foreground">{me ? roleLabels[me.role] : ""}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Uitloggen">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-14 left-0 z-20 w-60 border-r bg-background transition-transform md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <nav className="flex flex-col gap-1 p-3">
            {nav
              .filter((n) => n.show)
              .map(({ to, label, icon: Icon, badge }) => {
                const active = location.pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={closeMobile}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{label}</span>
                    {badge && badge > 0 ? (
                      <Badge variant={active ? "secondary" : "default"} className="ml-auto">
                        {badge}
                      </Badge>
                    ) : null}
                  </Link>
                );
              })}
          </nav>
        </aside>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/30 md:hidden"
            onClick={closeMobile}
            aria-hidden
          />
        )}

        <main className="flex-1 min-w-0 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

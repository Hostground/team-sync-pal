import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExternalLink } from "lucide-react";
import { type CalEvent, statusBadgeVariant, statusLabels } from "./calendar-utils";

function Body({ event }: { event: CalEvent }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusBadgeVariant(event.status)}>
          {statusLabels[event.status] ?? event.status}
        </Badge>
        {event.typeName && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground"
              style={event.typeColor ? { backgroundColor: event.typeColor } : undefined}
            />
            {event.typeName}
          </span>
        )}
      </div>
      <dl className="grid grid-cols-[6rem_1fr] gap-y-1.5">
        <dt className="text-muted-foreground">Wanneer</dt>
        <dd>
          {format(event.start, "EEEE d MMM yyyy", { locale: nl })}
          <br />
          {format(event.start, "HH:mm")} – {format(event.end, "HH:mm")}
        </dd>
        <dt className="text-muted-foreground">Medewerker</dt>
        <dd>{event.assignee ?? "—"}</dd>
        {event.location && (
          <>
            <dt className="text-muted-foreground">Locatie</dt>
            <dd>{event.location}</dd>
          </>
        )}
        {event.customer && (
          <>
            <dt className="text-muted-foreground">Klant</dt>
            <dd>{event.customer}</dd>
          </>
        )}
      </dl>
      <Button asChild className="w-full">
        <Link to="/planning/$id" params={{ id: event.id }}>
          <ExternalLink className="h-4 w-4" /> Open activiteit
        </Link>
      </Button>
    </div>
  );
}

export function EventDetail({
  event,
  onOpenChange,
}: {
  event: CalEvent | null;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const open = !!event;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle className="pr-6">{event?.title}</SheetTitle>
          </SheetHeader>
          {event && <Body event={event} />}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="pr-6">{event?.title}</DialogTitle>
        </DialogHeader>
        {event && <Body event={event} />}
      </DialogContent>
    </Dialog>
  );
}

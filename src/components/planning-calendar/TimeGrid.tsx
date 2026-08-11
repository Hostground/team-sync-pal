import { format, isSameDay, isToday } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  type CalEvent,
  HOUR_HEIGHT,
  eventsOnDay,
  layoutDay,
  statusLabels,
} from "./calendar-utils";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function statusRing(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-primary/15 border-primary text-foreground";
    case "pending":
      return "bg-secondary border-muted-foreground/40 text-foreground";
    case "declined":
    case "auto_declined":
      return "bg-destructive/10 border-destructive text-foreground";
    default:
      return "bg-muted border-border text-muted-foreground line-through";
  }
}

export function TimeGrid({
  days,
  events,
  onSelect,
  onDayHeaderClick,
}: {
  days: Date[];
  events: CalEvent[];
  onSelect: (e: CalEvent) => void;
  onDayHeaderClick?: (d: Date) => void;
}) {
  const single = days.length === 1;

  return (
    <div className="overflow-x-auto">
      <div className={cn("min-w-full", !single && "min-w-[720px]")}>
        {/* header */}
        <div
          className="grid border-b bg-card sticky top-0 z-10"
          style={{ gridTemplateColumns: `3rem repeat(${days.length}, minmax(0,1fr))` }}
        >
          <div />
          {days.map((d) => (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onDayHeaderClick?.(d)}
              className={cn(
                "py-2 text-center text-xs border-l",
                isToday(d) ? "font-semibold text-primary" : "text-muted-foreground",
              )}
            >
              <div>{format(d, "EEEEEE", { locale: nl })}</div>
              <div className="text-sm">{format(d, "d")}</div>
            </button>
          ))}
        </div>

        {/* body */}
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `3rem repeat(${days.length}, minmax(0,1fr))` }}
        >
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="text-[10px] text-muted-foreground text-right pr-1 -translate-y-1.5"
                style={{ height: HOUR_HEIGHT }}
              >
                {h > 0 && `${String(h).padStart(2, "0")}:00`}
              </div>
            ))}
          </div>

          {days.map((day) => {
            const laid = layoutDay(eventsOnDay(events, day), day);
            return (
              <div
                key={day.toISOString()}
                className={cn("relative border-l", isToday(day) && "bg-accent/30")}
              >
                {HOURS.map((h) => (
                  <div key={h} className="border-b border-border/60" style={{ height: HOUR_HEIGHT }} />
                ))}
                {laid.map(({ event, top, height, col, cols }) => (
                  <button
                    key={event.id + day.toISOString()}
                    type="button"
                    onClick={() => onSelect(event)}
                    className={cn(
                      "absolute rounded-md border-l-4 border px-1.5 py-1 text-left text-[11px] overflow-hidden",
                      statusRing(event.status),
                    )}
                    style={{
                      top: (top / 60) * HOUR_HEIGHT,
                      height: (height / 60) * HOUR_HEIGHT - 2,
                      left: `calc(${(col / cols) * 100}% + 2px)`,
                      width: `calc(${100 / cols}% - 4px)`,
                      borderLeftColor: event.typeColor ?? undefined,
                    }}
                    title={`${event.title} · ${statusLabels[event.status] ?? event.status}`}
                  >
                    <div className="font-medium leading-tight truncate">{event.title}</div>
                    <div className="opacity-80 truncate">
                      {format(event.start, "HH:mm")}–{format(event.end, "HH:mm")}
                    </div>
                    {height > 60 && event.assignee && (
                      <div className="opacity-70 truncate">{event.assignee}</div>
                    )}
                  </button>
                ))}
                {isSameDay(day, new Date()) && <NowLine />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NowLine() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return (
    <div
      className="absolute left-0 right-0 border-t-2 border-destructive pointer-events-none"
      style={{ top: (minutes / 60) * HOUR_HEIGHT }}
    />
  );
}

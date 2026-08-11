import { format, isSameMonth, isToday } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { type CalEvent, eventsOnDay, monthGridDays } from "./calendar-utils";

const WEEKDAYS = ["ma", "di", "wo", "do", "vr", "za", "zo"];

export function MonthGrid({
  anchor,
  events,
  onSelect,
  onDayClick,
}: {
  anchor: Date;
  events: CalEvent[];
  onSelect: (e: CalEvent) => void;
  onDayClick: (d: Date) => void;
}) {
  const days = monthGridDays(anchor);

  return (
    <div>
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1.5 text-center text-xs text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const list = eventsOnDay(events, day);
          const outside = !isSameMonth(day, anchor);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[84px] border-b border-r p-1 space-y-1",
                outside && "bg-muted/40",
              )}
            >
              <button
                type="button"
                onClick={() => onDayClick(day)}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  isToday(day)
                    ? "bg-primary text-primary-foreground font-semibold"
                    : outside
                      ? "text-muted-foreground"
                      : "text-foreground",
                )}
              >
                {format(day, "d")}
              </button>
              {list.slice(0, 3).map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => onSelect(e)}
                  className="block w-full truncate rounded border-l-4 bg-accent/60 px-1 py-0.5 text-left text-[10px] leading-tight"
                  style={{ borderLeftColor: e.typeColor ?? undefined }}
                  title={`${format(e.start, "HH:mm")} ${e.title}`}
                >
                  <span className="font-medium">{format(e.start, "HH:mm")}</span> {e.title}
                </button>
              ))}
              {list.length > 3 && (
                <button
                  type="button"
                  onClick={() => onDayClick(day)}
                  className="text-[10px] text-muted-foreground underline"
                >
                  +{list.length - 3} meer
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="sr-only">{format(anchor, "LLLL yyyy", { locale: nl })}</p>
    </div>
  );
}

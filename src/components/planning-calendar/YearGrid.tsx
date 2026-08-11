import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  startOfYear,
  addMonths,
} from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { type CalEvent, countsByDay } from "./calendar-utils";

export function YearGrid({
  anchor,
  events,
  onMonthClick,
  onDayClick,
}: {
  anchor: Date;
  events: CalEvent[];
  onMonthClick: (d: Date) => void;
  onDayClick: (d: Date) => void;
}) {
  const counts = countsByDay(events);
  const months = Array.from({ length: 12 }, (_, i) => addMonths(startOfYear(anchor), i));

  return (
    <div className="grid gap-4 p-3 sm:grid-cols-2 lg:grid-cols-3">
      {months.map((m) => {
        const days = eachDayOfInterval({
          start: startOfWeek(startOfMonth(m), { weekStartsOn: 1 }),
          end: endOfWeek(endOfMonth(m), { weekStartsOn: 1 }),
        });
        return (
          <div key={m.toISOString()} className="rounded-lg border p-2">
            <button
              type="button"
              onClick={() => onMonthClick(m)}
              className="mb-1 w-full text-left text-sm font-medium capitalize hover:underline"
            >
              {format(m, "LLLL", { locale: nl })}
            </button>
            <div className="grid grid-cols-7 gap-0.5">
              {["m", "d", "w", "d", "v", "z", "z"].map((d, i) => (
                <div key={i} className="text-center text-[9px] text-muted-foreground">
                  {d}
                </div>
              ))}
              {days.map((day) => {
                const n = counts.get(format(day, "yyyy-MM-dd")) ?? 0;
                const outside = !isSameMonth(day, m);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => onDayClick(day)}
                    title={
                      n > 0
                        ? `${format(day, "d MMM", { locale: nl })}: ${n} activiteit${n > 1 ? "en" : ""}`
                        : format(day, "d MMM", { locale: nl })
                    }
                    className={cn(
                      "aspect-square rounded-sm text-[9px] leading-none flex items-center justify-center",
                      outside && "opacity-30",
                      isToday(day) && "ring-1 ring-primary",
                      n === 0 && "bg-muted/40 text-muted-foreground",
                      n === 1 && "bg-primary/25",
                      n === 2 && "bg-primary/50",
                      n >= 3 && "bg-primary/80 text-primary-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

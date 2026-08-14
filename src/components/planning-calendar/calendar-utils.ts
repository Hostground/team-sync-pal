import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  addMonths,
  addYears,
  eachDayOfInterval,
  format,
  isSameDay,
} from "date-fns";
import { nl } from "date-fns/locale";

export type CalendarView = "day" | "week" | "month" | "year";

export type CalEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  typeName?: string | null;
  typeColor?: string | null;
  assignee?: string | null;
  location?: string | null;
  customer?: string | null;
};

export const statusLabels: Record<string, string> = {
  pending: "In afwachting",
  confirmed: "Bevestigd",
  declined: "Geweigerd",
  auto_declined: "Auto-geweigerd",
  cancelled: "Geannuleerd",
  completed: "Afgerond",
};

export function statusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "confirmed":
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "declined":
    case "auto_declined":
      return "destructive";
    default:
      return "outline";
  }
}

/** Visible range for a view, used both for rendering and for query filters. */
export function visibleRange(view: CalendarView, anchor: Date): { from: Date; to: Date } {
  switch (view) {
    case "day":
      return { from: startOfDay(anchor), to: endOfDay(anchor) };
    case "week":
      return {
        from: startOfWeek(anchor, { weekStartsOn: 1 }),
        to: endOfWeek(anchor, { weekStartsOn: 1 }),
      };
    case "month":
      return {
        from: startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 }),
        to: endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 }),
      };
    case "year":
      return { from: startOfYear(anchor), to: endOfYear(anchor) };
  }
}

export function shiftAnchor(view: CalendarView, anchor: Date, dir: 1 | -1): Date {
  switch (view) {
    case "day":
      return addDays(anchor, dir);
    case "week":
      return addDays(anchor, 7 * dir);
    case "month":
      return addMonths(anchor, dir);
    case "year":
      return addYears(anchor, dir);
  }
}

export function rangeTitle(view: CalendarView, anchor: Date): string {
  switch (view) {
    case "day":
      return format(anchor, "EEEE d MMMM yyyy", { locale: nl });
    case "week": {
      const { from, to } = visibleRange("week", anchor);
      const w = format(anchor, "I", { locale: nl });
      return `wk ${w} · ${format(from, "d MMM", { locale: nl })} – ${format(to, "d MMM yyyy", { locale: nl })}`;
    }
    case "month":
      return format(anchor, "LLLL yyyy", { locale: nl });
    case "year":
      return format(anchor, "yyyy");
  }
}

export function daysOfWeek(anchor: Date): Date[] {
  const { from, to } = visibleRange("week", anchor);
  return eachDayOfInterval({ start: from, end: to });
}

export function monthGridDays(anchor: Date): Date[] {
  const { from, to } = visibleRange("month", anchor);
  return eachDayOfInterval({ start: from, end: to });
}

export function eventsOnDay(events: CalEvent[], day: Date): CalEvent[] {
  return events
    .filter((e) => isSameDay(e.start, day) || (e.start < startOfDay(day) && e.end > startOfDay(day)))
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function countsByDay(events: CalEvent[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of events) {
    const k = format(e.start, "yyyy-MM-dd");
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

/** Minutes from midnight, clamped to the given day. */
export function dayOffsets(event: CalEvent, day: Date): { top: number; height: number } {
  const dayStart = startOfDay(day).getTime();
  const dayEnd = endOfDay(day).getTime();
  const s = Math.max(event.start.getTime(), dayStart);
  const e = Math.min(Math.max(event.end.getTime(), s + 15 * 60000), dayEnd);
  const top = (s - dayStart) / 60000;
  const height = Math.max((e - s) / 60000, 30);
  return { top, height };
}

export type LaidOutEvent = { event: CalEvent; top: number; height: number; col: number; cols: number };

/** Side-by-side layout for overlapping events on one day. */
export function layoutDay(events: CalEvent[], day: Date): LaidOutEvent[] {
  const items = events.map((event) => ({ event, ...dayOffsets(event, day) }));
  items.sort((a, b) => a.top - b.top || b.height - a.height);

  const out: LaidOutEvent[] = [];
  let cluster: typeof items = [];
  let clusterEnd = -1;

  const flush = () => {
    if (!cluster.length) return;
    const columns: number[] = [];
    const placed = cluster.map((it) => {
      let col = columns.findIndex((end) => end <= it.top);
      if (col === -1) {
        col = columns.length;
        columns.push(0);
      }
      columns[col] = it.top + it.height;
      return { ...it, col };
    });
    const cols = columns.length;
    placed.forEach((p) => out.push({ ...p, cols }));
    cluster = [];
    clusterEnd = -1;
  };

  for (const it of items) {
    if (cluster.length && it.top >= clusterEnd) flush();
    cluster.push(it);
    clusterEnd = Math.max(clusterEnd, it.top + it.height);
  }
  flush();
  return out;
}

export const HOUR_HEIGHT = 48;

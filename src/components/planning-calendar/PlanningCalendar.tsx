import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { TimeGrid } from "./TimeGrid";
import { MonthGrid } from "./MonthGrid";
import { YearGrid } from "./YearGrid";
import { EventDetail } from "./EventDetail";
import {
  type CalEvent,
  type CalendarView,
  HOUR_HEIGHT,
  daysOfWeek,
  rangeTitle,
  shiftAnchor,
} from "./calendar-utils";

export function PlanningCalendar({
  view,
  anchor,
  events,
  isLoading,
  onViewChange,
  onAnchorChange,
}: {
  view: CalendarView;
  anchor: Date;
  events: CalEvent[];
  isLoading?: boolean;
  onViewChange: (v: CalendarView) => void;
  onAnchorChange: (d: Date) => void;
}) {
  const [selected, setSelected] = useState<CalEvent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if ((view === "day" || view === "week") && scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, [view]);

  const go = (dir: 1 | -1) => onAnchorChange(shiftAnchor(view, anchor, dir));

  const openDay = (d: Date) => {
    onAnchorChange(d);
    onViewChange("day");
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => go(-1)} aria-label="Vorige">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => go(1)} aria-label="Volgende">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onAnchorChange(new Date())}>
              <CalendarDays className="h-4 w-4" /> Vandaag
            </Button>
          </div>
          <p className="flex-1 text-sm font-medium capitalize">{rangeTitle(view, anchor)}</p>
          <Tabs value={view} onValueChange={(v) => onViewChange(v as CalendarView)}>
            <TabsList>
              <TabsTrigger value="day">Dag</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Maand</TabsTrigger>
              <TabsTrigger value="year">Jaar</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading && (
          <p className="px-3 py-2 text-xs text-muted-foreground">Laden…</p>
        )}

        <div
          ref={scrollRef}
          className={
            view === "day" || view === "week"
              ? "max-h-[70vh] overflow-y-auto relative"
              : "relative"
          }
          onTouchStart={(e) => {
            touchX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const start = touchX.current;
            const end = e.changedTouches[0]?.clientX ?? null;
            touchX.current = null;
            if (start == null || end == null) return;
            const dx = end - start;
            if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
          }}
        >
          {view === "day" && (
            <TimeGrid days={[anchor]} events={events} onSelect={setSelected} />
          )}
          {view === "week" && (
            <TimeGrid
              days={daysOfWeek(anchor)}
              events={events}
              onSelect={setSelected}
              onDayHeaderClick={openDay}
            />
          )}
          {view === "month" && (
            <MonthGrid
              anchor={anchor}
              events={events}
              onSelect={setSelected}
              onDayClick={openDay}
            />
          )}
          {view === "year" && (
            <YearGrid
              anchor={anchor}
              events={events}
              onMonthClick={(d) => {
                onAnchorChange(d);
                onViewChange("month");
              }}
              onDayClick={openDay}
            />
          )}
        </div>
      </CardContent>

      <EventDetail event={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </Card>
  );
}

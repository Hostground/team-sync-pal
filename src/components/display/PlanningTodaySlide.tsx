import type { DisplayPayload } from "@/lib/display.functions";

export function PlanningTodaySlide({
  items,
  timezone,
  title,
}: {
  items: DisplayPayload["today"];
  timezone: string;
  title: string | null;
}) {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("nl-BE", { hour: "2-digit", minute: "2-digit", timeZone: timezone }).format(
      new Date(iso),
    );

  return (
    <div className="flex h-full w-full flex-col justify-center px-[8vw] py-[10vh]">
      <h2 className="mb-[4vh] text-[6vh] font-bold leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
        {title ?? "Vandaag"}
      </h2>
      {items.length === 0 ? (
        <p className="text-[3.6vh] opacity-80">Geen activiteiten gepland vandaag.</p>
      ) : (
        <ul className="flex flex-col gap-[2vh]">
          {items.slice(0, 8).map((it, i) => (
            <li
              key={i}
              className="flex items-baseline gap-[2vw] rounded-[1vh] bg-black/25 px-[2vw] py-[1.6vh] backdrop-blur-sm"
            >
              <span className="w-[16vw] shrink-0 text-[3.6vh] font-semibold tabular-nums">
                {fmt(it.start)}–{fmt(it.end)}
              </span>
              <span className="flex-1 text-[3.4vh] font-medium">{it.title}</span>
              {it.location ? <span className="text-[2.6vh] opacity-80">{it.location}</span> : null}
              {it.person ? <span className="text-[2.6vh] opacity-80">· {it.person}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

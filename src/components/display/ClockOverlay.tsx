import { useEffect, useState } from "react";

export function ClockOverlay({ timezone, position }: { timezone: string; position: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = new Intl.DateTimeFormat("nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(now);
  const date = new Intl.DateTimeFormat("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: timezone,
  }).format(now);

  const pos: Record<string, string> = {
    "top-left": "top-[4vh] left-[4vw] items-start",
    "top-right": "top-[4vh] right-[4vw] items-end",
    "bottom-left": "bottom-[4vh] left-[4vw] items-start",
    "bottom-right": "bottom-[4vh] right-[4vw] items-end",
  };

  return (
    <div className={`pointer-events-none absolute z-20 flex flex-col ${pos[position] ?? pos["top-right"]}`}>
      <div className="text-[9vh] font-semibold leading-none tabular-nums drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
        {time}
      </div>
      <div className="mt-[1vh] text-[2.6vh] capitalize opacity-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
        {date}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import type { DisplayPayload } from "@/lib/display.functions";
import { PhotoBackdrop } from "./PhotoBackdrop";
import { PlanningTodaySlide } from "./PlanningTodaySlide";
import { ClockOverlay } from "./ClockOverlay";

export function SlideShow({ data }: { data: DisplayPayload }) {
  const slides = data.slides;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;
    const current = slides[Math.min(index, slides.length - 1)];
    const ms = Math.max(3, current?.seconds ?? 10) * 1000;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), ms);
    return () => clearTimeout(t);
  }, [index, slides]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  const theme = data.theme ?? {};
  const bg = theme.bg ?? "#0b1220";
  const text = theme.text ?? "#ffffff";
  const overlay = typeof theme.overlay === "number" ? theme.overlay : 0.35;
  const scale = typeof theme.textScale === "number" ? theme.textScale : 1;

  const slide = slides[Math.min(index, Math.max(0, slides.length - 1))];

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ backgroundColor: bg, color: text, fontSize: `${scale}rem` }}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === index ? 1 : 0, zIndex: i === index ? 1 : 0 }}
        >
          {s.images.length > 0 ? <PhotoBackdrop images={s.images} seconds={s.seconds} /> : null}
          {s.images.length > 0 ? (
            <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlay})` }} />
          ) : null}
          <div className="relative h-full w-full">
            {s.kind === "planning_today" ? (
              <PlanningTodaySlide items={data.today} timezone={data.timezone} title={s.title} />
            ) : (
              <div className="flex h-full w-full flex-col justify-center px-[8vw]">
                {s.title ? (
                  <h2
                    className="text-[8vh] font-bold leading-[1.05] drop-shadow-[0_2px_16px_rgba(0,0,0,0.65)]"
                    style={{ transform: `scale(${1})` }}
                  >
                    {s.title}
                  </h2>
                ) : null}
                {s.body ? (
                  <p className="mt-[3vh] max-w-[70vw] whitespace-pre-line text-[4vh] leading-snug opacity-95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                    {s.body}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ))}

      {slides.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center text-[4vh] opacity-70">
          Nog geen slides ingesteld
        </div>
      ) : null}

      {data.show_clock ? <ClockOverlay timezone={data.timezone} position={data.clock_position} /> : null}

      {slides.length > 1 ? (
        <div className="absolute bottom-[3vh] left-1/2 z-20 flex -translate-x-1/2 gap-[1vw]">
          {slides.map((s, i) => (
            <span
              key={s.id}
              className="h-[0.9vh] w-[0.9vh] rounded-full transition-opacity"
              style={{ backgroundColor: text, opacity: i === index ? 0.95 : 0.35 }}
            />
          ))}
        </div>
      ) : null}
      {slide ? null : null}
    </div>
  );
}

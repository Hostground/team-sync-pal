import { useEffect, useState } from "react";

/**
 * Fullscreen photo backdrop with slow Ken Burns motion and crossfade
 * between multiple images belonging to the same slide.
 */
export function PhotoBackdrop({ images, seconds }: { images: string[]; seconds: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const per = Math.max(4, Math.round((seconds * 1000) / images.length));
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), per);
    return () => clearInterval(t);
  }, [images, seconds]);

  useEffect(() => setIndex(0), [images]);

  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className="absolute inset-0 transition-opacity duration-[1600ms]"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <img
            src={src}
            alt=""
            className={`h-full w-full object-cover ${i % 2 === 0 ? "display-kenburns-a" : "display-kenburns-b"}`}
          />
        </div>
      ))}
    </div>
  );
}

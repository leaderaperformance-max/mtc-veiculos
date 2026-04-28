import { useEffect, useRef, useState } from "react";

const FALLBACK = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800";

interface Props {
  images: string[];
  alt: string;
}

export function VehicleImageSlider({ images, alt }: Props) {
  const list = images.length > 0 ? images : [FALLBACK];
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (list.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, 1200);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => () => stop(), []);

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={start}
      onMouseLeave={() => { stop(); setIndex(0); }}
    >
      <img
        key={index}
        src={list[index]}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      {list.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 pointer-events-none">
          {list.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "bg-white scale-125" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

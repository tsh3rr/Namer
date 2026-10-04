"use client";

import { useMemo } from "react";

// Deterministic pseudo-random so server and client render the same markup.
function rand(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const COLORS = ["#ec8f97", "#79aedf", "#8bb58e", "#f0b94a", "#f9c9cb", "#bcd7f2"];

/** Lightweight CSS confetti: no canvas, no dependency. */
export function Confetti({ pieces = 70 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: rand(i, 1) * 100,
        delay: rand(i, 2) * 0.8,
        duration: 2.4 + rand(i, 3) * 2,
        size: 6 + rand(i, 4) * 8,
        drift: `${(rand(i, 5) - 0.5) * 200}px`,
        color: COLORS[i % COLORS.length],
        round: rand(i, 6) > 0.5,
      })),
    [pieces],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          className="animate-fall absolute top-0 block"
          style={
            {
              left: `${b.left}%`,
              width: b.size,
              height: b.round ? b.size : b.size * 0.45,
              background: b.color,
              borderRadius: b.round ? "999px" : "2px",
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
              "--drift": b.drift,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

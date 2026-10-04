"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Confetti } from "./confetti";

const SLIDES = [
  {
    emoji: "🎁",
    title: "Willkommen! 1.000 Punkte für dich",
    text: "Damit tippst du auf alles rund ums Baby. Es sind reine Spielpunkte, also kein Risiko.",
  },
  {
    emoji: "📈",
    title: "Die Prozente sind die Quoten",
    text: "62 % bei „Mädchen“ heißt: Die Gruppe hält das für ziemlich wahrscheinlich. Ein Anteil kostet dann 0,62 Punkte und zahlt 1 Punkt, wenn es stimmt. Mutige Tipps auf Außenseiter bringen mehr.",
  },
  {
    emoji: "💌",
    title: "Lade weitere Gäste ein",
    text: "Für jede Person, die über deinen Link mitmacht, bekommst du 100 Bonuspunkte. Den Link findest du unter „Einladen“.",
  },
];

export function WelcomeTour({ name }: { name: string }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const path = usePathname();
  if (!open) return null;

  const close = () => {
    setOpen(false);
    router.replace(path, { scroll: false });
  };
  const s = SLIDES[i];
  return (
    <>
      {i === 0 && <Confetti />}
      <div
        className="fixed inset-0 z-40 flex items-end justify-center bg-ink/30 p-4 backdrop-blur-sm sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
      >
        <div key={i} className="card animate-pop w-full max-w-md p-7 text-center">
          <div className="text-5xl">{s.emoji}</div>
          <h2 id="tour-title" className="mt-4 font-display text-2xl font-semibold">
            {i === 0 ? `Hallo ${name}! ` : ""}
            {s.title}
          </h2>
          <p className="mt-3 text-ink-soft">{s.text}</p>
          <div className="mt-6 flex justify-center gap-1.5">
            {SLIDES.map((_, j) => (
              <span
                key={j}
                className={`h-1.5 rounded-full transition-all ${j === i ? "w-6 bg-accent-600" : "w-1.5 bg-line"}`}
              />
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <button type="button" className="btn-ghost flex-1" onClick={close}>
              Überspringen
            </button>
            <button
              type="button"
              className="btn-accent flex-1"
              onClick={() => (i < SLIDES.length - 1 ? setI(i + 1) : close())}
            >
              {i < SLIDES.length - 1 ? "Weiter" : "Los geht’s!"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

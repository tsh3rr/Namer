import { outcomeColor, pct } from "@/lib/format";
import type { OutcomeView } from "@/lib/pools";

type Point = { at: Date; prices: Record<string, number> };

/** Small server-rendered SVG line chart of price history (top outcomes). */
export function PriceChart({
  history,
  outcomes,
}: {
  history: Point[];
  outcomes: OutcomeView[];
}) {
  const W = 600;
  const H = 180;
  const pad = 8;
  const shown = [...outcomes]
    .map((o, i) => ({ ...o, color: outcomeColor(o.label, i) }))
    .sort((a, b) => b.price - a.price)
    .slice(0, 4);
  // Always end at "now" so a quiet market still draws a flat line.
  const pts = [...history, { at: new Date(), prices: Object.fromEntries(outcomes.map((o) => [o.id, o.price])) }];
  const n = pts.length;
  const x = (i: number) => pad + (i / Math.max(n - 1, 1)) * (W - pad * 2);
  const y = (p: number) => pad + (1 - p) * (H - pad * 2);

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full" role="img" aria-label="Verlauf der Quoten">
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={pad} x2={W - pad} y1={y(g)} y2={y(g)} stroke="var(--color-line)" strokeDasharray="4 6" />
        ))}
        {shown.map((o) => {
          // Outcomes added later (new names) start where they joined.
          let last = 0;
          const d = pts
            .map((p, i) => {
              const v = p.prices[o.id];
              if (v === undefined) return null;
              last = v;
              return `${x(i).toFixed(1)},${y(last).toFixed(1)}`;
            })
            .filter(Boolean);
          if (!d.length) return null;
          return (
            <polyline
              key={o.id}
              points={d.join(" ")}
              fill="none"
              stroke={o.color}
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {shown.map((o) => (
          <span key={o.id} className="inline-flex items-center gap-1.5 font-bold">
            <span className="size-2.5 rounded-full" style={{ background: o.color }} />
            {o.label} {pct(o.price)}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

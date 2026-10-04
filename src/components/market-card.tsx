import Link from "next/link";
import type { MarketView } from "@/lib/pools";
import { emojiFor } from "@/lib/markets";
import { outcomeColor, pct, pts } from "@/lib/format";

function StatusChip({ m }: { m: MarketView }) {
  if (m.status === "resolved")
    return <span className="chip bg-sage-100 text-sage-600">Aufgelöst</span>;
  if (m.status === "closed")
    return <span className="chip bg-sun-100 text-sun-600">Geschlossen</span>;
  return (
    <span className="chip">
      <span className="size-1.5 animate-pulse rounded-full bg-sage-400" /> Live
    </span>
  );
}

export function MarketCard({ m, href }: { m: MarketView; href: string }) {
  const winner = m.outcomes.find((o) => o.id === m.resolvedOutcomeId);
  const isBinary = m.outcomes.length === 2;
  const top = [...m.outcomes].sort((a, b) => b.price - a.price).slice(0, 5);

  return (
    <Link
      href={href}
      className="card group block p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-2xl">
            {emojiFor(m.kind)}
          </span>
          <h3 className="font-display text-lg leading-tight font-semibold">
            {m.question}
          </h3>
        </div>
        <StatusChip m={m} />
      </div>

      {winner ? (
        <p className="mt-4 rounded-2xl bg-sage-50 px-4 py-3 font-extrabold">
          🎉 {winner.label}
        </p>
      ) : isBinary ? (
        <div className="mt-4 flex h-11 overflow-hidden rounded-2xl">
          {m.outcomes.map((o, i) => (
            <div
              key={o.id}
              className="flex min-w-[4.5rem] items-center justify-center px-2 text-sm font-extrabold whitespace-nowrap transition-all duration-700"
              style={{
                width: `${o.price * 100}%`,
                background: outcomeColor(o.label, i),
              }}
            >
              {o.label} {pct(o.price)}
            </div>
          ))}
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {top.map((o) => (
            <li key={o.id} className="flex items-center gap-3 text-sm">
              <span className="min-w-0 flex-1 truncate font-bold">{o.label}</span>
              <span className="h-2.5 w-16 shrink-0 overflow-hidden rounded-full bg-cream sm:w-24">
                <span
                  className="block h-full rounded-full bg-accent-400 transition-all duration-700"
                  style={{ width: `${Math.max(o.price * 100, 2)}%` }}
                />
              </span>
              <span className="w-11 text-right font-bold tabular-nums">
                {pct(o.price)}
              </span>
            </li>
          ))}
          {m.outcomes.length > top.length && (
            <li className="text-xs text-ink-soft">
              + {m.outcomes.length - top.length} weitere
            </li>
          )}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-ink-soft">
        <span>
          {m.traders} {m.traders === 1 ? "Person tippt" : "Personen tippen"} ·{" "}
          {pts(m.volume)} Punkte im Spiel
        </span>
        <span className="font-bold text-accent-600 group-hover:underline">
          {m.status === "open" ? "Tippen →" : "Ansehen →"}
        </span>
      </div>
    </Link>
  );
}

"use client";

import { useActionState, useMemo, useState } from "react";
import { placeTrade, suggestOutcome } from "@/app/actions";
import { outcomeColor, num1, pct, pts } from "@/lib/format";
import { prices, proceedsForShares, sharesForAmount } from "@/lib/lmsr";

type O = { id: string; label: string; shares: number; price: number; isCatchAll: boolean };

export function TradePanel({
  marketId,
  liquidity,
  outcomes,
  balance,
  held,
  canTrade,
  reason,
}: {
  marketId: string;
  liquidity: number;
  outcomes: O[];
  balance: number;
  held: Record<string, number>;
  canTrade: boolean;
  reason?: string;
}) {
  const [state, action, pending] = useActionState(placeTrade, undefined);
  const [selected, setSelected] = useState(outcomes[0]?.id);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("50");

  const idx = outcomes.findIndex((o) => o.id === selected);
  const o = outcomes[idx];
  const q = outcomes.map((x) => x.shares);
  const value = Number(amount.replace(",", ".")) || 0;
  const myShares = held[selected ?? ""] ?? 0;

  const preview = useMemo(() => {
    if (idx < 0 || value <= 0) return null;
    if (side === "buy") {
      const s = sharesForAmount(q, liquidity, idx, Math.min(value, balance));
      const after = q.slice();
      after[idx] += s;
      return { shares: s, payout: s, newPrice: prices(after, liquidity)[idx] };
    }
    const s = Math.min(value, myShares);
    const after = q.slice();
    after[idx] -= s;
    return {
      shares: s,
      payout: proceedsForShares(q, liquidity, idx, s),
      newPrice: prices(after, liquidity)[idx],
    };
    // q is derived from outcomes; listing it would re-run on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, value, side, balance, myShares, liquidity, outcomes]);

  const quick = side === "buy" ? [10, 50, 100, 250] : [];

  return (
    <div className="card p-5">
      <div className="space-y-2">
        {outcomes.map((x, i) => {
          const on = x.id === selected;
          const mine = held[x.id] ?? 0;
          return (
            <button
              key={x.id}
              type="button"
              onClick={() => setSelected(x.id)}
              className={`relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border-2 px-4 py-3 text-left transition ${
                on ? "border-ink" : "border-line hover:border-accent-200"
              }`}
            >
              <span
                className="absolute inset-y-0 left-0 opacity-25 transition-all duration-700"
                style={{ width: `${x.price * 100}%`, background: outcomeColor(x.label, i) }}
              />
              <span className="relative flex-1 font-bold">
                {x.label}
                {mine > 0.01 && (
                  <span className="ml-2 text-xs font-bold text-accent-600">
                    · du hältst {num1(mine)}
                  </span>
                )}
              </span>
              <span className="relative font-display text-xl font-semibold tabular-nums">
                {pct(x.price)}
              </span>
            </button>
          );
        })}
      </div>

      {canTrade ? (
        <form action={action} className="mt-5 border-t border-line pt-5">
          <input type="hidden" name="marketId" value={marketId} />
          <input type="hidden" name="outcomeId" value={selected} />
          <input type="hidden" name="side" value={side} />
          <div className="grid grid-cols-2 gap-1 rounded-full bg-cream p-1 text-sm font-bold">
            {(["buy", "sell"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSide(s);
                  setAmount(s === "sell" ? (myShares > 0 ? myShares.toFixed(1) : "") : "50");
                }}
                className={`rounded-full py-2 transition ${side === s ? "bg-white shadow-soft" : "text-ink-soft"}`}
              >
                {s === "buy" ? "Tippen" : "Verkaufen"}
              </button>
            ))}
          </div>

          <label className="label mt-4" htmlFor="amount">
            {side === "buy" ? `Punkte auf „${o?.label}“` : `Anteile von „${o?.label}“ verkaufen`}
          </label>
          <div className="relative">
            <input
              id="amount"
              name="amount"
              inputMode="decimal"
              className="input pr-16 text-lg font-bold tabular-nums"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            />
            <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm font-bold text-ink-soft">
              {side === "buy" ? "Punkte" : "Anteile"}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {quick.map((v) => (
              <button key={v} type="button" className="chip hover:bg-accent-100" onClick={() => setAmount(String(v))}>
                {v}
              </button>
            ))}
            <button
              type="button"
              className="chip hover:bg-accent-100"
              onClick={() =>
                setAmount(side === "buy" ? String(Math.floor(balance)) : myShares.toFixed(1))
              }
            >
              Max
            </button>
          </div>

          {preview && (
            <dl className="mt-4 space-y-1.5 rounded-2xl bg-accent-50 p-4 text-sm">
              {side === "buy" ? (
                <>
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">Du bekommst</dt>
                    <dd className="font-bold tabular-nums">{num1(preview.shares)} Anteile</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">Gewinn, wenn es stimmt</dt>
                    <dd className="font-extrabold text-sage-600 tabular-nums">
                      {pts(preview.payout)} P (+{pts(preview.payout - Math.min(value, balance))})
                    </dd>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Du erhältst</dt>
                  <dd className="font-extrabold tabular-nums">{pts(preview.payout)} P</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-soft">Prognose danach</dt>
                <dd className="font-bold tabular-nums">{pct(preview.newPrice)}</dd>
              </div>
            </dl>
          )}

          <button
            className="btn-primary mt-4 w-full text-lg"
            disabled={pending || !preview || (side === "buy" && value > balance + 1e-9)}
          >
            {pending
              ? "Einen Moment …"
              : side === "buy"
                ? value > balance
                  ? "Nicht genug Punkte"
                  : `Auf ${o?.label} tippen`
                : "Verkaufen"}
          </button>
          {state?.error && (
            <p role="alert" className="mt-3 text-sm font-bold text-blush-600">{state.error}</p>
          )}
          {state?.ok && (
            <p role="status" className="animate-pop mt-3 rounded-2xl bg-sage-50 px-4 py-3 text-sm font-bold text-sage-600">
              {state.ok} 🎉
            </p>
          )}
        </form>
      ) : (
        <p className="mt-5 rounded-2xl bg-cream px-4 py-3 text-sm text-ink-soft">{reason}</p>
      )}
    </div>
  );
}

export function SuggestName({ marketId }: { marketId: string }) {
  const [state, action, pending] = useActionState(suggestOutcome, undefined);
  return (
    <form action={action} className="card p-5">
      <h2 className="font-display text-lg font-semibold">Fehlt ein Name?</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Schlag ihn vor. Neue Namen starten mit einer niedrigen Prognose, frühe Tipps lohnen sich also.
      </p>
      <input type="hidden" name="marketId" value={marketId} />
      <div className="mt-3 flex gap-2">
        <input name="label" className="input" placeholder="z. B. Frieda" maxLength={30} required key={state?.ok} />
        <button className="btn-soft shrink-0" disabled={pending}>
          Vorschlagen
        </button>
      </div>
      {state?.error && <p className="mt-2 text-sm font-bold text-blush-600">{state.error}</p>}
      {state?.ok && <p className="mt-2 text-sm font-bold text-sage-600">{state.ok}</p>}
    </form>
  );
}


"use client";

import { useActionState, useState } from "react";
import {
  addMarket,
  resolveMarket,
  setMarketOpen,
  updateSettings,
  type ActionState,
} from "@/app/actions";

function Msg({ state }: { state: ActionState }) {
  if (state?.error)
    return <p role="alert" className="mt-2 text-sm font-bold text-blush-600">{state.error}</p>;
  if (state?.ok)
    return <p role="status" className="mt-2 text-sm font-bold text-sage-600">{state.ok}</p>;
  return null;
}

type Base = { slug: string; adminKey?: string };

function Hidden({ slug, adminKey }: Base) {
  return (
    <>
      <input type="hidden" name="slug" value={slug} />
      {adminKey && <input type="hidden" name="key" value={adminKey} />}
    </>
  );
}

const THEMES = [
  { v: "blush", label: "Rosé", c: "var(--color-blush-400)" },
  { v: "sky", label: "Himmelblau", c: "var(--color-sky-400)" },
  { v: "sage", label: "Salbei", c: "var(--color-sage-400)" },
  { v: "sun", label: "Sonnengelb", c: "var(--color-sun-400)" },
];

export function SettingsForm({
  slug,
  adminKey,
  pool,
}: Base & {
  pool: {
    babyName: string;
    parentNames: string | null;
    dueDate: string | null;
    stakes: string | null;
    theme: string;
    premium: boolean;
  };
}) {
  const [state, action, pending] = useActionState(updateSettings, undefined);
  return (
    <form action={action} className="space-y-4">
      <Hidden slug={slug} adminKey={adminKey} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="babyName">Spitzname fürs Baby</label>
          <input id="babyName" name="babyName" className="input" defaultValue={pool.babyName} required maxLength={40} />
        </div>
        <div>
          <label className="label" htmlFor="parentNames">Eltern</label>
          <input id="parentNames" name="parentNames" className="input" defaultValue={pool.parentNames ?? ""} maxLength={60} />
        </div>
        <div>
          <label className="label" htmlFor="dueDate">Errechneter Termin</label>
          <input id="dueDate" name="dueDate" type="date" className="input" defaultValue={pool.dueDate ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="stakes">Spaßpreis</label>
          <input id="stakes" name="stakes" className="input" defaultValue={pool.stakes ?? ""} maxLength={140} />
        </div>
      </div>
      <fieldset>
        <legend className="label">
          Farbwelt {!pool.premium && <span className="chip ml-1 bg-sun-100 text-sun-600">Plus</span>}
        </legend>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => {
            const locked = !pool.premium && t.v !== "blush" && t.v !== pool.theme;
            return (
              <label
                key={t.v}
                className={`flex cursor-pointer items-center gap-2 rounded-full border-2 px-3 py-2 text-sm font-bold has-checked:border-ink ${
                  locked ? "cursor-not-allowed opacity-50" : "border-line"
                }`}
              >
                <input type="radio" name="theme" value={t.v} defaultChecked={pool.theme === t.v} disabled={locked} className="sr-only" />
                <span className="size-4 rounded-full" style={{ background: t.c }} />
                {t.label}
                {locked && " 🔒"}
              </label>
            );
          })}
        </div>
      </fieldset>
      <button className="btn-primary" disabled={pending}>Speichern</button>
      <Msg state={state} />
    </form>
  );
}

export function MarketAdmin({
  slug,
  adminKey,
  market,
}: Base & {
  market: {
    id: string;
    kind: string;
    question: string;
    status: "open" | "closed" | "resolved";
    outcomes: { id: string; label: string; isCatchAll: boolean; price: number }[];
    resolvedOutcomeId: string | null;
  };
}) {
  const [openState, openAction, openPending] = useActionState(setMarketOpen, undefined);
  const [resState, resAction, resPending] = useActionState(resolveMarket, undefined);
  const [choice, setChoice] = useState("");
  const [confirming, setConfirming] = useState(false);
  const chosen = market.outcomes.find((o) => o.id === choice);

  if (market.status === "resolved") {
    const w = market.outcomes.find((o) => o.id === market.resolvedOutcomeId);
    return (
      <div className="rounded-3xl border border-line p-4">
        <p className="font-bold">{market.question}</p>
        <p className="mt-1 text-sm text-sage-600">✓ Aufgelöst: {w?.label}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold">{market.question}</p>
        <form action={openAction}>
          <Hidden slug={slug} adminKey={adminKey} />
          <input type="hidden" name="marketId" value={market.id} />
          <input type="hidden" name="open" value={market.status === "open" ? "0" : "1"} />
          <button className="btn-ghost px-3 py-1.5 text-sm" disabled={openPending}>
            {market.status === "open" ? "Tippen pausieren" : "Wieder öffnen"}
          </button>
        </form>
      </div>
      <Msg state={openState} />

      <form action={resAction} className="mt-3">
        <Hidden slug={slug} adminKey={adminKey} />
        <input type="hidden" name="marketId" value={market.id} />
        <label className="label" htmlFor={`res-${market.id}`}>Ergebnis eintragen</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            id={`res-${market.id}`}
            name="outcomeId"
            className="input"
            value={choice}
            onChange={(e) => {
              setChoice(e.target.value);
              setConfirming(false);
            }}
          >
            <option value="">Bitte wählen …</option>
            {market.outcomes.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          {!confirming ? (
            <button key="ask" type="button" className="btn-accent shrink-0" disabled={!choice} onClick={() => setConfirming(true)}>
              Auflösen
            </button>
          ) : (
            // Separate key so the confirm click can't submit in the same event.
            <button key="confirm" className="btn-primary shrink-0" disabled={resPending}>
              Sicher? Auszahlen 🎉
            </button>
          )}
        </div>
        {market.kind === "name" && chosen?.isCatchAll && (
          <div className="mt-3">
            <label className="label" htmlFor={`rn-${market.id}`}>Wie heißt das Baby?</label>
            <input id={`rn-${market.id}`} name="revealedName" className="input" maxLength={30} placeholder="Der echte Name" />
          </div>
        )}
        {confirming && (
          <p className="mt-2 text-xs text-ink-soft">
            Das kann nicht rückgängig gemacht werden. Alle richtigen Anteile werden sofort ausgezahlt.
          </p>
        )}
        <Msg state={resState} />
      </form>
    </div>
  );
}

export function AddMarketForm({
  slug,
  adminKey,
  missing,
  premium,
}: Base & {
  missing: { kind: string; title: string; emoji: string }[];
  premium: boolean;
}) {
  const [state, action, pending] = useActionState(addMarket, undefined);
  const [custom, setCustom] = useState(false);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {missing.map((t) => (
          <form key={t.kind} action={action}>
            <Hidden slug={slug} adminKey={adminKey} />
            <input type="hidden" name="kind" value={t.kind} />
            <button className="btn-soft text-sm" disabled={pending}>
              {t.emoji} {t.title} hinzufügen
            </button>
          </form>
        ))}
        <button
          type="button"
          className="btn-ghost text-sm"
          onClick={() => setCustom(!custom)}
        >
          ✨ Eigene Frage {!premium && <span className="chip bg-sun-100 text-sun-600">Plus</span>}
        </button>
      </div>
      {custom && (
        <form action={action} className="mt-4 space-y-3 rounded-3xl bg-cream/60 p-4">
          <Hidden slug={slug} adminKey={adminKey} />
          <input type="hidden" name="kind" value="custom" />
          <div>
            <label className="label" htmlFor="question">Frage</label>
            <input id="question" name="question" className="input" placeholder="z. B. Hat das Baby bei der Geburt Haare?" maxLength={80} required />
          </div>
          <div>
            <label className="label" htmlFor="options">Antworten (eine pro Zeile)</label>
            <textarea id="options" name="options" className="input min-h-28" placeholder={"Ja, ganz viele\nEin bisschen Flaum\nGlatze"} required />
          </div>
          <button className="btn-primary" disabled={pending || !premium}>
            {premium ? "Frage erstellen" : "Nur mit Plus verfügbar"}
          </button>
        </form>
      )}
      <Msg state={state} />
    </div>
  );
}

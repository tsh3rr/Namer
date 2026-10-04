"use client";

import { useActionState } from "react";
import { joinPool } from "@/app/actions";
import { LOCALE } from "@/lib/brand";

export function JoinCard({
  slug,
  babyName,
  inviter,
  refId,
  adminKey,
  startingPoints,
}: {
  slug: string;
  babyName: string;
  inviter?: string;
  refId?: string;
  adminKey?: string;
  startingPoints: number;
}) {
  const [state, action, pending] = useActionState(joinPool, undefined);
  return (
    <form action={action} className="card animate-pop relative overflow-hidden p-6 md:p-8">
      <div className="absolute -top-10 -right-10 size-40 rounded-full bg-accent-100" />
      <div className="relative">
        <p className="text-sm font-bold text-accent-600">
          {inviter ? `${inviter} lädt dich ein` : "Du bist eingeladen"}
        </p>
        <h2 className="mt-1 font-display text-3xl font-semibold text-balance">
          Tipp mit bei {babyName}!
        </h2>
        <ol className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <li className="rounded-2xl bg-cream/70 p-3">
            <span className="text-lg">🎁</span>
            <p className="mt-1 font-bold">
              {startingPoints.toLocaleString(LOCALE)} Spielpunkte geschenkt
            </p>
            <p className="text-ink-soft">Kein Echtgeld, keine Anmeldung.</p>
          </li>
          <li className="rounded-2xl bg-cream/70 p-3">
            <span className="text-lg">📈</span>
            <p className="mt-1 font-bold">Live-Prognose der Gruppe</p>
            <p className="text-ink-soft">Wer gegen den Trend richtig liegt, sammelt mehr Punkte.</p>
          </li>
          <li className="rounded-2xl bg-cream/70 p-3">
            <span className="text-lg">🏆</span>
            <p className="mt-1 font-bold">Gewinnen bei der Geburt</p>
            <p className="text-ink-soft">Jeder richtige Anteil zahlt 1 Punkt aus.</p>
          </li>
        </ol>
        <input type="hidden" name="slug" value={slug} />
        {refId && <input type="hidden" name="ref" value={refId} />}
        {adminKey && <input type="hidden" name="key" value={adminKey} />}
        <label className="label mt-6" htmlFor="displayName">
          Wie sollen dich die anderen sehen?
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="displayName"
            name="displayName"
            className="input"
            placeholder="z. B. Oma Gisela"
            maxLength={32}
            required
            autoComplete="given-name"
          />
          <button className="btn-accent shrink-0" disabled={pending}>
            {pending ? "Moment …" : "Mitmachen"}
          </button>
        </div>
        {adminKey && (
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" name="asParent" value="1" className="size-4 accent-[var(--accent-600)]" />
            Ich bin Mama oder Papa (dann tippe ich nicht mit)
          </label>
        )}
        {state?.error && (
          <p role="alert" className="mt-3 text-sm font-bold text-blush-600">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}

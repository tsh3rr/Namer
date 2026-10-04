"use client";

import { useActionState, useRef, useState } from "react";
import { createPool } from "@/app/actions";
import { MARKET_TEMPLATES } from "@/lib/markets";

const STAKE_IDEAS = [
  "Wer verliert, bringt Windeln mit 🧷",
  "Die Gewinnerin darf als Erste kuscheln",
  "Letzter Platz übernimmt eine Nachtschicht 🌙",
  "Gewinner schlägt den Zweitnamen vor",
];

const STEP_TITLES = ["Los geht’s", "Das Baby", "Die Fragen", "Der Spaßpreis"];

export function CreateWizard() {
  const [state, action, pending] = useActionState(createPool, undefined);
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<"parent" | "friend" | null>(null);
  const [selected, setSelected] = useState<string[]>(
    MARKET_TEMPLATES.map((t) => t.kind),
  );
  const [names, setNames] = useState<string[]>([]);
  const [nameDraft, setNameDraft] = useState("");
  const [stakes, setStakes] = useState("");
  const [stepError, setStepError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function next() {
    const form = formRef.current!;
    // Validate only the visible step's inputs before moving on.
    const fields = form.querySelectorAll<HTMLInputElement>(
      `[data-step="${step}"] input[required]`,
    );
    for (const f of fields) {
      if (!f.checkValidity()) {
        f.reportValidity();
        return;
      }
    }
    if (step === 0 && !role) return setStepError("Wähle eine Option.");
    if (step === 2 && selected.length === 0)
      return setStepError("Wähle mindestens eine Frage aus.");
    setStepError(null);
    setStep((s) => s + 1);
  }

  function addName() {
    const n = nameDraft.trim();
    if (n && !names.some((x) => x.toLowerCase() === n.toLowerCase()))
      setNames([...names, n].slice(0, 12));
    setNameDraft("");
  }

  const isParent = role === "parent";
  const last = STEP_TITLES.length - 1;

  return (
    <form
      ref={formRef}
      action={action}
      className="card overflow-hidden"
      onKeyDown={(e) => {
        // Enter advances the wizard instead of submitting half-filled data.
        if (e.key === "Enter" && step < last && (e.target as HTMLElement).tagName === "INPUT") {
          e.preventDefault();
          if ((e.target as HTMLInputElement).name === "nameDraft") addName();
          else next();
        }
      }}
    >
      <div className="h-1.5 bg-cream">
        <div
          className="h-full rounded-r-full bg-blush-400 transition-all duration-500"
          style={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }}
        />
      </div>
      <div className="p-6 md:p-8">
        <p className="text-sm font-bold text-ink-soft">
          Schritt {step + 1} von {STEP_TITLES.length} · {STEP_TITLES[step]}
        </p>

        {/* Step 0: who are you */}
        <section data-step="0" hidden={step !== 0} className="animate-pop">
          <h1 className="mt-2 font-display text-3xl font-semibold">
            Wer legt die Tipprunde an?
          </h1>
          <input type="hidden" name="role" value={role ?? ""} />
          <div className="mt-6 grid gap-3">
            {(
              [
                {
                  v: "parent",
                  emoji: "🤰",
                  title: "Wir bekommen ein Baby!",
                  text: "Ihr seid Gastgeber. Weil ihr vielleicht schon mehr wisst, tippt ihr selbst nicht mit.",
                },
                {
                  v: "friend",
                  emoji: "🥳",
                  title: "Ich organisiere das für Freunde",
                  text: "Du bist Gastgeber und darfst mittippen. Den Eltern-Link kannst du später weitergeben.",
                },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => {
                  setRole(o.v);
                  setStepError(null);
                  setStep(1);
                }}
                className={`flex gap-4 rounded-3xl border-2 p-5 text-left transition hover:border-blush-400 ${
                  role === o.v ? "border-blush-400 bg-blush-50" : "border-line"
                }`}
              >
                <span className="text-4xl">{o.emoji}</span>
                <span>
                  <span className="block text-lg font-extrabold">{o.title}</span>
                  <span className="mt-1 block text-sm text-ink-soft">{o.text}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Step 1: the baby */}
        <section data-step="1" hidden={step !== 1} className="animate-pop">
          <h1 className="mt-2 font-display text-3xl font-semibold">
            {isParent ? "Erzählt uns von eurem Baby" : "Um welches Baby geht’s?"}
          </h1>
          <div className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="creatorName">
                Dein Name
              </label>
              <input
                id="creatorName"
                name="creatorName"
                className="input"
                placeholder={isParent ? "z. B. Lisa" : "z. B. Tante Jule"}
                maxLength={32}
                required
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="label" htmlFor="babyName">
                Spitzname fürs Baby
              </label>
              <input
                id="babyName"
                name="babyName"
                className="input"
                placeholder="z. B. Baby Müller oder Krümel"
                maxLength={40}
                required
              />
              <p className="mt-1.5 text-xs text-ink-soft">
                So heißt eure Tipprunde, bis der echte Name feststeht.
              </p>
            </div>
            <div>
              <label className="label" htmlFor="parentNames">
                {isParent ? "Eltern (optional)" : "Wer sind die Eltern? (optional)"}
              </label>
              <input
                id="parentNames"
                name="parentNames"
                className="input"
                placeholder="z. B. Lisa & Tom"
                maxLength={60}
              />
            </div>
            <div>
              <label className="label" htmlFor="dueDate">
                Errechneter Termin (optional)
              </label>
              <input id="dueDate" name="dueDate" type="date" className="input" />
            </div>
          </div>
        </section>

        {/* Step 2: markets */}
        <section data-step="2" hidden={step !== 2} className="animate-pop">
          <h1 className="mt-2 font-display text-3xl font-semibold">
            Worauf soll getippt werden?
          </h1>
          <p className="mt-2 text-ink-soft">
            Du kannst später jederzeit Fragen hinzufügen.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {MARKET_TEMPLATES.map((t) => {
              const on = selected.includes(t.kind);
              return (
                <label
                  key={t.kind}
                  className={`relative cursor-pointer rounded-3xl border-2 p-4 transition ${
                    on ? "border-blush-400 bg-blush-50" : "border-line"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="markets"
                    value={t.kind}
                    checked={on}
                    onChange={() =>
                      setSelected(
                        on
                          ? selected.filter((k) => k !== t.kind)
                          : [...selected, t.kind],
                      )
                    }
                    className="sr-only"
                  />
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="mt-1 block font-extrabold">{t.title}</span>
                  <span className="block text-xs text-ink-soft">
                    {t.question}
                  </span>
                  <span
                    className={`absolute top-3 right-3 flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                      on ? "bg-blush-600 text-white" : "bg-cream text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </label>
              );
            })}
          </div>
          {selected.includes("name") && (
            <div className="mt-6 rounded-3xl bg-cream/70 p-4">
              <label className="label" htmlFor="nameDraft">
                Erste Namensideen (optional)
              </label>
              <div className="flex gap-2">
                <input
                  id="nameDraft"
                  name="nameDraft"
                  className="input"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="z. B. Ella"
                  maxLength={30}
                />
                <button type="button" className="btn-soft shrink-0" onClick={addName}>
                  +
                </button>
              </div>
              <input type="hidden" name="nameIdeas" value={names.join(",")} />
              {names.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {names.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNames(names.filter((x) => x !== n))}
                      className="chip bg-white text-ink"
                      aria-label={`${n} entfernen`}
                    >
                      {n} ✕
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-ink-soft">
                Alle Gäste können später eigene Vorschläge ergänzen.
                {isParent && " Tipp: Verratet nicht zu viel 😉"}
              </p>
            </div>
          )}
        </section>

        {/* Step 3: stakes + summary */}
        <section data-step="3" hidden={step !== 3} className="animate-pop">
          <h1 className="mt-2 font-display text-3xl font-semibold">
            Ein kleiner Spaßpreis?
          </h1>
          <p className="mt-2 text-ink-soft">
            Getippt wird nur mit Spielpunkten. Ein lustiger Spaßpreis macht es
            spannender, ist aber freiwillig.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {STAKE_IDEAS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStakes(s)}
                className={`chip px-3 py-2 text-sm ${
                  stakes === s ? "bg-blush-100 text-blush-600" : ""
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <input
            name="stakes"
            className="input mt-3"
            value={stakes}
            onChange={(e) => setStakes(e.target.value)}
            placeholder="Oder eigener Spaßpreis …"
            maxLength={140}
          />
          <div className="mt-6 rounded-3xl bg-sage-50 p-4 text-sm">
            <p className="font-extrabold">So geht es weiter</p>
            <ul className="mt-2 space-y-1 text-ink-soft">
              <li>• Jede Person startet mit 1.000 Spielpunkten.</li>
              <li>• Wer Freunde einlädt, bekommt 100 Bonuspunkte.</li>
              <li>• Nach der Geburt löst ihr die Fragen auf und kürt die Siegerin oder den Sieger.</li>
            </ul>
          </div>
        </section>

        {(stepError || state?.error) && (
          <p role="alert" className="mt-4 rounded-2xl bg-blush-50 px-4 py-3 text-sm font-bold text-blush-600">
            {stepError ?? state?.error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" className="btn-ghost" onClick={() => setStep(step - 1)}>
              Zurück
            </button>
          ) : (
            <span />
          )}
          {step === 0 ? null : step < last ? (
            // Distinct keys: React must not morph this node into the submit
            // button mid-click, or the browser submits the half-filled form.
            <button key="next" type="button" className="btn-primary" onClick={next}>
              Weiter
            </button>
          ) : (
            <button key="submit" type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Wird angelegt …" : "Tipprunde anlegen 🎉"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

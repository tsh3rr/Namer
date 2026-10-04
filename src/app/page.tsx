import Link from "next/link";
import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";
import { PLUS_PRICE_LABEL } from "@/lib/billing";
import { MARKET_TEMPLATES } from "@/lib/markets";
import { BRAND } from "@/lib/brand";

const steps = [
  {
    n: "1",
    title: "Tipprunde anlegen",
    text: "In 30 Sekunden: Spitzname fürs Baby, Termin, fertig. Ob Eltern oder beste Freundin.",
  },
  {
    n: "2",
    title: "Link in die Gruppe",
    text: "Alle steigen per WhatsApp-Link ein. Kein Konto, kein Passwort, kein App-Download.",
  },
  {
    n: "3",
    title: "Tippen, zittern, jubeln",
    text: "Die Prognose bewegt sich mit jedem Tipp. Wenn das Baby da ist, gewinnt, wer richtig lag.",
  },
];

function DemoMarket() {
  const rows = [
    { label: "Mädchen", p: 0.62, c: "var(--color-blush-400)" },
    { label: "Junge", p: 0.38, c: "var(--color-sky-400)" },
  ];
  const names = [
    { label: "Ella", p: 0.31 },
    { label: "Mila", p: 0.22 },
    { label: "Theo", p: 0.14 },
  ];
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="card animate-float relative z-10 p-5">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold">Junge oder Mädchen?</p>
          <span className="chip">🎀 24 Tipps</span>
        </div>
        <div className="mt-4 flex h-12 overflow-hidden rounded-2xl">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-center text-sm font-extrabold text-ink"
              style={{ width: `${r.p * 100}%`, background: r.c }}
            >
              {r.label} {Math.round(r.p * 100)} %
            </div>
          ))}
        </div>
        <p className="mt-5 font-display text-lg font-semibold">Wie heißt das Baby?</p>
        <ul className="mt-2 space-y-2">
          {names.map((n) => (
            <li key={n.label} className="flex items-center gap-3 text-sm">
              <span className="w-12 font-bold">{n.label}</span>
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream">
                <span
                  className="block h-full rounded-full bg-blush-200"
                  style={{ width: `${n.p * 100}%` }}
                />
              </span>
              <span className="w-10 text-right font-bold tabular-nums">
                {Math.round(n.p * 100)} %
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute -right-4 -bottom-5 z-20 rotate-3 rounded-2xl bg-ink px-4 py-2 text-sm font-bold text-white shadow-lift">
        Oma Gisela: +120 auf Ella 👵
      </div>
      <div className="absolute -top-6 -left-6 size-24 rounded-full bg-sky-100 blur-xl" />
      <div className="absolute -right-8 top-10 size-28 rounded-full bg-sun-100 blur-xl" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <Link href="/neu" className="btn-primary px-4 py-2 text-sm">
          Tipprunde starten
        </Link>
      </header>

      <main className="flex-1">
        <section className="bg-dots">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-8 pb-20 md:grid-cols-2 md:pt-16">
            <div>
              <span className="chip bg-blush-100 text-blush-600">
                Das Baby-Tippspiel für Freunde &amp; Familie
              </span>
              <h1 className="mt-5 font-display text-5xl leading-[1.05] font-semibold tracking-tight text-balance md:text-6xl">
                Junge oder Mädchen? Ella oder Mila?{" "}
                <span className="text-blush-600">Tippt drauf.</span>
              </h1>
              <p className="mt-5 max-w-md text-lg text-ink-soft">
                {BRAND.name} ist das Tippspiel fürs Baby: Freunde und Familie
                tippen mit Spielpunkten auf Geschlecht, Namen, Geburtstag,
                Gewicht und Größe. Die Prognose zeigt live, was alle glauben.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/neu" className="btn-primary text-lg">
                  Kostenlos Tipprunde anlegen
                </Link>
                <Link href="/so-gehts" className="btn-ghost">
                  So funktioniert&apos;s
                </Link>
              </div>
              <p className="mt-4 text-sm text-ink-soft">
                Ohne Anmeldung · Ohne Echtgeld · Perfekt für die WhatsApp-Gruppe
              </p>
            </div>
            <DemoMarket />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center font-display text-3xl font-semibold md:text-4xl">
            In drei Schritten zur Tipprunde
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="card p-6">
                <span className="flex size-10 items-center justify-center rounded-full bg-blush-100 font-display text-lg font-bold text-blush-600">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg font-extrabold">{s.title}</h3>
                <p className="mt-2 text-ink-soft">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-cream/60">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <h2 className="text-center font-display text-3xl font-semibold md:text-4xl">
              Worauf ihr tippen könnt
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
              {MARKET_TEMPLATES.map((t) => (
                <div key={t.kind} className="card p-5 text-center">
                  <div className="text-3xl">{t.emoji}</div>
                  <p className="mt-2 font-extrabold">{t.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{t.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-ink-soft">
              Mit {BRAND.plusName} auch eigene Fragen: „Wer weint bei der Geburt
              mehr?“ oder „Haare: ja oder nein?“
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center font-display text-3xl font-semibold md:text-4xl">
            Kostenlos starten, für die Party aufrüsten
          </h2>
          <div className="mx-auto mt-10 grid max-w-3xl gap-5 md:grid-cols-2">
            <div className="card p-6">
              <p className="font-display text-2xl font-semibold">Gratis</p>
              <p className="mt-1 text-ink-soft">Für immer, für alle.</p>
              <ul className="mt-5 space-y-2 text-sm">
                <li>✓ Geschlecht, Name, Termin, Gewicht, Größe</li>
                <li>✓ Unbegrenzt viele Mitspieler</li>
                <li>✓ Live-Prognosen, Rangliste, Einladungsbonus</li>
                <li>✓ Teilen per WhatsApp &amp; Co.</li>
              </ul>
            </div>
            <div className="card relative overflow-hidden border-blush-200 p-6">
              <span className="absolute top-4 right-4 chip bg-blush-100 text-blush-600">
                Beliebt
              </span>
              <p className="font-display text-2xl font-semibold">{BRAND.plusName}</p>
              <p className="mt-1 text-ink-soft">
                Einmalig {PLUS_PRICE_LABEL} pro Tipprunde
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                <li>✓ Eigene Fragen, ganz nach eurem Geschmack</li>
                <li>✓ Live-Modus für Babyparty &amp; Gender Reveal</li>
                <li>✓ Farbwelten: Rosé, Himmelblau, Salbei, Sonnengelb</li>
                <li>✓ Keine Werbung für alle Gäste</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="px-4 pb-24">
          <div className="mx-auto max-w-3xl rounded-[2rem] bg-ink px-6 py-12 text-center text-white">
            <h2 className="font-display text-3xl font-semibold text-balance">
              Die schönste Wartezeit eures Lebens verdient ein bisschen
              Spannung.
            </h2>
            <Link
              href="/neu"
              className="btn mt-8 bg-white text-lg text-ink hover:bg-cream"
            >
              Jetzt Tipprunde anlegen
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

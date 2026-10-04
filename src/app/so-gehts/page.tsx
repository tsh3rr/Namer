import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "So funktioniert’s" };

const FAQ = [
  {
    q: "Ist das Glücksspiel?",
    a: "Nein. Getippt wird ausschließlich mit Spielpunkten. Punkte kann man weder kaufen noch auszahlen. Es geht um Spaß und Ruhm in der Familie.",
  },
  {
    q: "Was bedeuten die Prozente?",
    a: "Sie zeigen, für wie wahrscheinlich die Gruppe eine Antwort hält. Ein Anteil kostet so viele Punkte wie sein Prozentwert (62 % = 0,62 Punkte) und zahlt 1 Punkt, wenn die Antwort stimmt.",
  },
  {
    q: "Warum bewegt sich die Prognose?",
    a: "Jeder Tipp macht eine Antwort teurer und die anderen günstiger. So entsteht eine Live-Prognose der ganzen Gruppe. Wer früh oder gegen den Trend richtig liegt, gewinnt am meisten.",
  },
  {
    q: "Kann ich einen Tipp zurücknehmen?",
    a: "Ja. Bis die Frage aufgelöst wird, kannst du deine Anteile zum aktuellen Stand wieder abgeben.",
  },
  {
    q: "Warum dürfen die Eltern nicht mittippen?",
    a: "Weil sie vielleicht schon mehr wissen 😉 Eltern sind Gastgeber: Sie laden ein und lösen die Fragen nach der Geburt auf.",
  },
  {
    q: "Brauche ich ein Konto?",
    a: "Nein. Link öffnen, Namen eintippen, fertig. Dein Gerät merkt sich, wer du bist.",
  },
  {
    q: `Was kostet ${BRAND.name}?`,
    a: `Nichts. Mit ${BRAND.plusName} bekommt ihr einmalig eigene Fragen, den Live-Modus für die Party, Farbwelten und keine Werbung.`,
  },
];

export default function HowItWorks() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-3xl px-4 py-5">
        <Logo />
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16">
        <h1 className="font-display text-4xl font-semibold">So funktioniert&apos;s</h1>
        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="card group p-5 open:shadow-lift">
              <summary className="flex cursor-pointer list-none items-center justify-between font-extrabold">
                {f.q}
                <span className="text-ink-soft transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/neu" className="btn-primary">Tipprunde anlegen</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

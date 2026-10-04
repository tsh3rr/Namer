import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { startPlusCheckout } from "@/app/billing-actions";
import { BRAND } from "@/lib/brand";
import { PLUS_PRICE_LABEL, demoBilling, stripe } from "@/lib/billing";
import { getPoolView, isAdmin } from "@/lib/pools";
import { getDeviceId } from "@/lib/session";

export const metadata: Metadata = { title: BRAND.plusName };

const FEATURES = [
  { e: "📺", t: "Live-Modus für die Party", d: "Quoten, Rangliste und Enthüllung groß auf Fernseher oder Beamer. Perfekt für Babyparty und Gender Reveal." },
  { e: "✨", t: "Eigene Wetten", d: "„Wer weint mehr, Mama oder Papa?“ oder „Kommt das Baby nachts?“: Fragt, was ihr wollt." },
  { e: "🎨", t: "Farbwelten", d: "Rosé, Himmelblau, Salbei oder Sonnengelb für eure Babywette." },
  { e: "🕊️", t: "Keine Werbung", d: "Für alle Gäste eurer Babywette, für immer." },
];

export default async function PlusPage({ params, searchParams }: PageProps<"/p/[slug]/plus">) {
  const { slug } = await params;
  const { fehler } = await searchParams;
  const view = await getPoolView(slug, await getDeviceId());
  if (!view) notFound();
  const { pool, me } = view;
  const admin = isAdmin(pool, me);
  const available = !!stripe || demoBilling;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="text-center">
        <span className="chip bg-sun-100 text-sun-600">Einmalig {PLUS_PRICE_LABEL}, kein Abo</span>
        <h1 className="mt-4 font-display text-4xl font-semibold text-balance">
          {BRAND.plusName} für {pool.babyName}
        </h1>
        <p className="mt-3 text-ink-soft">Mehr Spaß für alle Gäste und eine kleine Unterstützung für uns.</p>
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <li key={f.t} className="card p-5">
            <span className="text-3xl">{f.e}</span>
            <p className="mt-2 font-extrabold">{f.t}</p>
            <p className="mt-1 text-sm text-ink-soft">{f.d}</p>
          </li>
        ))}
      </ul>

      <div className="card mt-8 p-6 text-center">
        {pool.premium ? (
          <>
            <p className="font-display text-xl font-semibold">Plus ist bereits aktiv 💛</p>
            <Link href={`/p/${slug}/live`} className="btn-accent mt-4">Live-Modus öffnen</Link>
          </>
        ) : !admin ? (
          <p className="text-ink-soft">
            Plus können die Gastgeber unter „Verwalten“ freischalten. Erzähl ihnen doch davon! 😉
          </p>
        ) : available ? (
          <form action={startPlusCheckout}>
            <input type="hidden" name="slug" value={slug} />
            <button className="btn-primary text-lg">Jetzt freischalten · {PLUS_PRICE_LABEL}</button>
            <p className="mt-3 text-xs text-ink-soft">
              {demoBilling
                ? "Demo-Modus: Ohne Stripe-Schlüssel wird Plus in der Entwicklung sofort freigeschaltet."
                : "Sichere Zahlung über Stripe: Karte, Apple Pay, Google Pay, Klarna und mehr."}
            </p>
          </form>
        ) : (
          <p className="text-ink-soft">Plus ist bald verfügbar.</p>
        )}
        {fehler && <p className="mt-3 text-sm font-bold text-blush-600">Das hat leider nicht geklappt. Bitte versuch es noch einmal.</p>}
      </div>
    </main>
  );
}

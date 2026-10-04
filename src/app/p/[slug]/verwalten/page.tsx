import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyField } from "@/components/share";
import { BRAND } from "@/lib/brand";
import { PLUS_PRICE_LABEL, siteUrl } from "@/lib/billing";
import { MARKET_TEMPLATES } from "@/lib/markets";
import { getPoolView, isAdmin } from "@/lib/pools";
import { getDeviceId } from "@/lib/session";
import { AddMarketForm, MarketAdmin, SettingsForm } from "./forms";

export const metadata: Metadata = { title: "Verwalten", robots: { index: false } };

export default async function ManagePage({ params, searchParams }: PageProps<"/p/[slug]/verwalten">) {
  const { slug } = await params;
  const { key } = await searchParams;
  const view = await getPoolView(slug, await getDeviceId());
  if (!view) notFound();
  const { pool, me, markets } = view;
  const adminKey = typeof key === "string" && key === pool.adminKey ? key : undefined;

  if (!isAdmin(pool, me, adminKey))
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="text-5xl">🔒</div>
        <h1 className="mt-4 font-display text-3xl font-semibold">Nur für Gastgeber</h1>
        <p className="mt-2 text-ink-soft">Öffne den Gastgeber-Link, den du beim Anlegen bekommen hast.</p>
        <Link href={`/p/${slug}`} className="btn-primary mt-6">Zur Tipprunde</Link>
      </main>
    );

  const missing = MARKET_TEMPLATES.filter((t) => !markets.some((m) => m.kind === t.kind));

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="font-display text-4xl font-semibold">Verwalten</h1>

      {!pool.premium ? (
        <Link
          href={`/p/${slug}/plus`}
          className="card block bg-gradient-to-br from-sun-50 to-blush-50 p-6 transition hover:shadow-lift"
        >
          <p className="font-display text-xl font-semibold">✨ {BRAND.plusName} freischalten</p>
          <p className="mt-1 text-sm text-ink-soft">
            Eigene Fragen, Live-Modus für die Babyparty, Farbwelten und keine Werbung für alle
            Gäste. Einmalig {PLUS_PRICE_LABEL}.
          </p>
        </Link>
      ) : (
        <section className="card flex flex-wrap items-center justify-between gap-3 p-6">
          <div>
            <p className="font-display text-xl font-semibold">✨ {BRAND.plusName} ist aktiv</p>
            <p className="text-sm text-ink-soft">Danke für eure Unterstützung!</p>
          </div>
          <Link href={`/p/${slug}/live`} className="btn-accent">📺 Live-Modus öffnen</Link>
        </section>
      )}

      <section className="card p-6">
        <h2 className="font-display text-2xl font-semibold">Fragen auflösen</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Ist das Baby da? Tragt hier die Ergebnisse ein. Mit „Tippen pausieren“ könnt ihr eine
          Frage vorher schließen, zum Beispiel sobald die Wehen losgehen.
        </p>
        <div className="mt-5 space-y-3">
          {markets.map((m) => (
            <MarketAdmin
              key={m.id}
              slug={slug}
              adminKey={adminKey}
              market={{
                id: m.id,
                kind: m.kind,
                question: m.question,
                status: m.status,
                resolvedOutcomeId: m.resolvedOutcomeId,
                outcomes: m.outcomes.map((o) => ({ id: o.id, label: o.label, isCatchAll: o.isCatchAll, price: o.price })),
              }}
            />
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-2xl font-semibold">Frage hinzufügen</h2>
        <div className="mt-4">
          <AddMarketForm
            slug={slug}
            adminKey={adminKey}
            premium={pool.premium}
            missing={missing.map((t) => ({ kind: t.kind, title: t.title, emoji: t.emoji }))}
          />
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-2xl font-semibold">Einstellungen</h2>
        <div className="mt-4">
          <SettingsForm slug={slug} adminKey={adminKey} pool={pool} />
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-2xl font-semibold">🔑 Gastgeber-Link</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Wer diesen Link hat, kann die Tipprunde verwalten. Nur an die Eltern weitergeben.
        </p>
        <div className="mt-4">
          <CopyField label="Gastgeber-Link" value={`${siteUrl()}/p/${slug}?key=${pool.adminKey}`} />
        </div>
      </section>
    </main>
  );
}

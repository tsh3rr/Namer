import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PriceChart } from "@/components/price-chart";
import { ShareButtons } from "@/components/share";
import { siteUrl } from "@/lib/billing";
import { pct, pts, timeAgo } from "@/lib/format";
import { emojiFor } from "@/lib/markets";
import { getFeed, getPoolView, getPriceHistory } from "@/lib/pools";
import { getDeviceId } from "@/lib/session";
import { SuggestName, TradePanel } from "./trade-panel";

export async function generateMetadata({
  params,
}: PageProps<"/p/[slug]/m/[marketId]">): Promise<Metadata> {
  const { slug, marketId } = await params;
  const view = await getPoolView(slug, null);
  const m = view?.markets.find((x) => x.id === marketId);
  if (!view || !m) return {};
  const top = [...m.outcomes].sort((a, b) => b.price - a.price)[0];
  return {
    title: `${m.question} · ${view.pool.babyName}`,
    description: top ? `Aktuell vorn: ${top.label} mit ${pct(top.price)}. Tipp mit!` : undefined,
  };
}

export default async function MarketPage({
  params,
  searchParams,
}: PageProps<"/p/[slug]/m/[marketId]">) {
  const { slug, marketId } = await params;
  const { ref } = await searchParams;
  const view = await getPoolView(slug, await getDeviceId());
  if (!view) notFound();
  const { pool, me, markets, myHoldings } = view;
  const m = markets.find((x) => x.id === marketId);
  if (!m) notFound();

  const [history, feed] = await Promise.all([getPriceHistory(m), getFeed(pool.id, 60)]);
  const marketFeed = feed.filter((f) => f.marketId === m.id).slice(0, 10);
  const held = Object.fromEntries(
    myHoldings.filter((h) => h.marketId === m.id).map((h) => [h.outcomeId, h.shares]),
  );
  const winner = m.outcomes.find((o) => o.id === m.resolvedOutcomeId);

  const canTrade = !!me && me.role !== "parent" && m.status === "open";
  const reason = !me
    ? "Tritt der Babywette bei, um mitzutippen."
    : me.role === "parent"
      ? "Eltern wissen zu viel 😉 Ihr schaut nur zu."
      : m.status === "resolved"
        ? "Diese Wette ist aufgelöst."
        : "Die Gastgeber haben diese Wette geschlossen.";

  const top = [...m.outcomes].sort((a, b) => b.price - a.price)[0];
  const shareUrl = `${siteUrl()}/p/${slug}/m/${m.id}${me ? `?ref=${me.id}` : ""}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href={`/p/${slug}`} className="text-sm font-bold text-ink-soft hover:text-ink">
        ← Alle Wetten
      </Link>
      <div className="mt-4 flex items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-3xl bg-accent-100 text-3xl">
          {emojiFor(m.kind)}
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold md:text-4xl">{m.question}</h1>
          <p className="text-sm text-ink-soft">
            {m.traders} Mitspieler · {pts(m.volume)} Punkte bewegt
          </p>
        </div>
      </div>

      {winner && (
        <p className="mt-6 rounded-3xl bg-sage-100 px-6 py-4 text-lg font-extrabold">
          🎉 Ergebnis: {winner.label}
          {winner.isCatchAll && pool.revealedName ? ` (${pool.revealedName})` : ""}
          {held[winner.id] ? ` · Du hast ${pts(held[winner.id])} Punkte gewonnen!` : ""}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-display text-lg font-semibold">Verlauf</h2>
            <PriceChart history={history} outcomes={m.outcomes} />
          </section>

          {m.allowNewOutcomes && m.status === "open" && me && <SuggestName marketId={m.id} />}

          <section className="card p-5">
            <h2 className="font-display text-lg font-semibold">Letzte Tipps</h2>
            <ul className="mt-3 divide-y divide-line">
              {marketFeed.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span>
                    <span className="font-bold">{f.memberName}</span>{" "}
                    {f.shares > 0 ? "tippt" : "verkauft"}{" "}
                    <span className="font-bold text-accent-600">{f.outcomeLabel}</span>
                  </span>
                  <span className="shrink-0 text-ink-soft tabular-nums">
                    {pts(Math.abs(f.cost))} P · {timeAgo(f.createdAt)}
                  </span>
                </li>
              ))}
              {marketFeed.length === 0 && (
                <li className="py-2 text-sm text-ink-soft">Noch niemand hat getippt. Sei die oder der Erste!</li>
              )}
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-lg font-semibold">Wie funktionieren die Quoten?</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Jeder Anteil zahlt 1 Punkt, wenn seine Antwort stimmt, sonst 0. Der Preis eines
              Anteils entspricht der Wahrscheinlichkeit, die die Gruppe gerade sieht. Jeder Tipp
              verschiebt die Quote, und du kannst deine Anteile jederzeit vor der Auflösung
              wieder verkaufen.
            </p>
          </section>
        </div>

        <div className="order-first space-y-6 lg:sticky lg:top-20 lg:order-none lg:self-start">
          <TradePanel
            marketId={m.id}
            liquidity={m.liquidity}
            outcomes={m.outcomes.map((o) => ({
              id: o.id,
              label: o.label,
              shares: o.shares,
              price: o.price,
              isCatchAll: o.isCatchAll,
            }))}
            balance={me?.balance ?? 0}
            held={held}
            canTrade={canTrade}
            reason={reason}
          />
          {!me && (
            <Link
              href={`/p/${slug}${typeof ref === "string" ? `?ref=${encodeURIComponent(ref)}` : ""}`}
              className="btn-accent w-full"
            >
              Jetzt mitmachen
            </Link>
          )}
          <section className="card p-5">
            <h2 className="font-display text-lg font-semibold">Diskussion anheizen</h2>
            <ShareButtons
              url={shareUrl}
              text={
                top
                  ? `${m.question} Aktuell liegt „${top.label}“ bei ${pct(top.price)}. Was meinst du? 👶`
                  : `${m.question} Tipp mit! 👶`
              }
            />
          </section>
        </div>
      </div>
    </main>
  );
}

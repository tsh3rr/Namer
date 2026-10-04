import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { outcomeColor, pct, pts } from "@/lib/format";
import { emojiFor } from "@/lib/markets";
import { getPoolView } from "@/lib/pools";
import { getDeviceId } from "@/lib/session";
import { AutoRefresh } from "./auto-refresh";

export const metadata: Metadata = { title: "Live-Modus" };

export default async function LivePage({ params }: PageProps<"/p/[slug]/live">) {
  const { slug } = await params;
  const view = await getPoolView(slug, await getDeviceId());
  if (!view) notFound();
  const { pool, markets, board, feed } = view;

  if (!pool.premium)
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="text-5xl">📺</div>
        <h1 className="mt-4 font-display text-3xl font-semibold">Der Live-Modus gehört zu {BRAND.plusName}</h1>
        <p className="mt-2 text-ink-soft">Zeigt Quoten und Rangliste groß auf dem Fernseher, ideal für die Babyparty.</p>
        <Link href={`/p/${slug}/plus`} className="btn-primary mt-6">Mehr erfahren</Link>
      </main>
    );

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-8">
      <AutoRefresh seconds={8} />
      <div className="flex items-end justify-between gap-6">
        <h1 className="font-display text-5xl font-semibold lg:text-7xl">{pool.babyName}</h1>
        <p className="text-right text-lg text-ink-soft">
          Mitmachen unter
          <span className="block font-mono text-2xl font-bold text-ink">
            {process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") ?? ""}/p/{slug}
          </span>
        </p>
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-6 lg:grid-cols-2">
          {markets.map((m) => {
            const winner = m.outcomes.find((o) => o.id === m.resolvedOutcomeId);
            return (
              <section key={m.id} className="card p-6">
                <h2 className="font-display text-3xl font-semibold">
                  {emojiFor(m.kind)} {m.question}
                </h2>
                {winner ? (
                  <p className="animate-pop mt-6 font-display text-5xl font-semibold text-accent-600">🎉 {winner.label}</p>
                ) : (
                  <ul className="mt-5 space-y-3">
                    {[...m.outcomes].sort((a, b) => b.price - a.price).slice(0, 5).map((o, i) => (
                      <li key={o.id} className="flex items-center gap-4 text-xl">
                        <span className="w-48 truncate font-bold">{o.label}</span>
                        <span className="h-6 flex-1 overflow-hidden rounded-full bg-cream">
                          <span
                            className="block h-full rounded-full transition-all duration-1000"
                            style={{ width: `${Math.max(o.price * 100, 2)}%`, background: outcomeColor(o.label, i) }}
                          />
                        </span>
                        <span className="w-20 text-right font-display text-2xl font-semibold tabular-nums">{pct(o.price)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
        <aside className="space-y-6">
          <section className="card p-6">
            <h2 className="font-display text-3xl font-semibold">🏆 Rangliste</h2>
            <ol className="mt-4 space-y-2 text-xl">
              {board.slice(0, 8).map((r) => (
                <li key={r.member.id} className="flex justify-between gap-3">
                  <span className="truncate font-bold">{r.rank}. {r.member.displayName}</span>
                  <span className="tabular-nums">{pts(r.net)}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="card p-6">
            <h2 className="font-display text-2xl font-semibold">Gerade getippt</h2>
            <ul className="mt-3 space-y-2 text-lg">
              {feed.slice(0, 5).map((f) => (
                <li key={f.id} className="animate-pop">
                  <b>{f.memberName}</b> → {f.outcomeLabel}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ad-slot";
import { Confetti } from "@/components/confetti";
import { GiftIdeas } from "@/components/gift-ideas";
import { MarketCard } from "@/components/market-card";
import { ShareButtons } from "@/components/share";
import { WelcomeTour } from "@/components/welcome-tour";
import { siteUrl } from "@/lib/billing";
import { daysUntil, dueDateLabel, pts, timeAgo } from "@/lib/format";
import { getPool, getPoolView, positionValue } from "@/lib/pools";
import { getDeviceId } from "@/lib/session";
import { claimHost } from "@/app/actions";
import { JoinCard } from "./join-card";

export async function generateMetadata({
  params,
}: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const pool = await getPool(slug);
  if (!pool) return {};
  const title = `Tipprunde: ${pool.babyName}`;
  const description = pool.parentNames
    ? `${pool.parentNames} bekommen ein Baby! Junge oder Mädchen? Welcher Name? Tipp mit.`
    : "Junge oder Mädchen? Welcher Name? Tipp mit – nur mit Spielpunkten.";
  return { title, description, openGraph: { title, description } };
}

export default async function PoolPage({
  params,
  searchParams,
}: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const view = await getPoolView(slug, await getDeviceId());
  if (!view) notFound();
  const { pool, me, markets, board, feed, members, myHoldings } = view;

  const ref = typeof sp.ref === "string" ? sp.ref : undefined;
  const key = typeof sp.key === "string" && sp.key === pool.adminKey ? sp.key : undefined;
  const inviter = members.find((m) => m.id === ref)?.displayName;
  const days = daysUntil(pool.dueDate);
  const gender = markets.find((m) => m.kind === "gender" && m.status === "resolved");
  const genderWinner = gender?.outcomes.find((o) => o.id === gender.resolvedOutcomeId);
  const born = !!(genderWinner || pool.revealedName);
  const inviteUrl = `${siteUrl()}/p/${slug}${me ? `?ref=${me.id}` : ""}`;
  const myRank = me ? board.find((r) => r.member.id === me.id) : undefined;
  const invested = me ? positionValue(myHoldings, markets) : 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {me && sp.willkommen && <WelcomeTour name={me.displayName} />}
      {born && <Confetti pieces={50} />}

      {/* Hero */}
      <section className="text-center">
        {born ? (
          <>
            <p className="chip bg-sage-100 text-sage-600">Das Geheimnis ist gelüftet</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-balance md:text-5xl">
              {genderWinner ? `Es ist ein ${genderWinner.label}!` : "Willkommen auf der Welt!"}
              {pool.revealedName && (
                <span className="block text-accent-600">{pool.revealedName} ✨</span>
              )}
            </h1>
          </>
        ) : (
          <>
            {pool.parentNames && (
              <p className="text-sm font-bold text-ink-soft">
                {pool.parentNames} bekommen ein Baby
              </p>
            )}
            <h1 className="mt-2 font-display text-4xl font-semibold text-balance md:text-5xl">
              Die Tipprunde für {pool.babyName}
            </h1>
          </>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {pool.dueDate && days !== null && !born && (
            <span className="chip bg-white">
              📅{" "}
              {days > 0
                ? `Noch ${days} Tage bis zum ${dueDateLabel(pool.dueDate)}`
                : days === 0
                  ? "Heute ist der errechnete Termin!"
                  : `${-days} Tage über dem Termin`}
            </span>
          )}
          <span className="chip bg-white">👥 {members.length} dabei</span>
          {pool.stakes && <span className="chip bg-white">🎯 Spaßpreis: {pool.stakes}</span>}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {!me && (
            <JoinCard
              slug={slug}
              babyName={pool.babyName}
              inviter={inviter}
              refId={ref}
              adminKey={key}
              startingPoints={pool.startingPoints}
            />
          )}

          {me && me.role !== "parent" && (
            <section className="card flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
              <div>
                <p className="text-xs font-bold text-ink-soft">Frei verfügbar</p>
                <p className="font-display text-2xl font-semibold tabular-nums">{pts(me.balance)} P</p>
              </div>
              <div>
                <p className="text-xs font-bold text-ink-soft">In Tipps (aktueller Wert)</p>
                <p className="font-display text-2xl font-semibold tabular-nums">{pts(invested)} P</p>
              </div>
              {myRank && (
                <div>
                  <p className="text-xs font-bold text-ink-soft">Platz</p>
                  <p className="font-display text-2xl font-semibold">
                    {myRank.rank} <span className="text-base text-ink-soft">von {board.length}</span>
                  </p>
                </div>
              )}
              <Link href={`/p/${slug}/einladen`} className="btn-soft ml-auto text-sm">
                +100 P pro Einladung
              </Link>
            </section>
          )}

          {me?.role === "player" && key && (
            <form action={claimHost} className="card flex flex-wrap items-center gap-3 border-sun-200 bg-sun-50 p-5 text-sm">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="key" value={key} />
              <p className="flex-1">
                <span className="font-extrabold">🔑 Gastgeber-Link erkannt.</span>{" "}
                Möchtest du diese Tipprunde mitverwalten?
              </p>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="asParent" value="1" /> Ich bin Mama oder Papa
              </label>
              <button className="btn-primary text-sm">Gastgeber werden</button>
            </form>
          )}

          {me?.role === "parent" && (
            <section className="card bg-accent-50 p-5 text-sm">
              <p className="font-extrabold">Ihr seid die Gastgeber 💛</p>
              <p className="mt-1 text-ink-soft">
                Eltern tippen nicht mit, schließlich wisst ihr vielleicht mehr. Teilt
                den Link und löst die Fragen nach der Geburt unter „Verwalten“ auf.
              </p>
            </section>
          )}

          <section className="grid gap-4 md:grid-cols-2">
            {markets.map((m) => (
              <MarketCard key={m.id} m={m} href={`/p/${slug}/m/${m.id}`} />
            ))}
            {markets.length === 0 && (
              <p className="card p-6 text-ink-soft md:col-span-2">
                Noch keine Fragen. Gastgeber können unter „Verwalten“ welche anlegen.
              </p>
            )}
          </section>

          {me && (
            <section className="card p-5">
              <h2 className="font-display text-xl font-semibold">Mehr Mitspieler, mehr Spaß</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Teile die Tipprunde mit der Familie. Für jede neue Person gibt es{" "}
                {pool.inviteBonus} Bonuspunkte für dich.
              </p>
              <ShareButtons
                url={inviteUrl}
                text={`👶 Junge oder Mädchen? Tipp mit bei der Tipprunde für ${pool.babyName}!`}
              />
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="font-display text-xl font-semibold">Rangliste</h2>
            <ol className="mt-3 space-y-1">
              {board.slice(0, 10).map((r) => (
                <li
                  key={r.member.id}
                  className={`flex items-center gap-3 rounded-2xl px-2 py-1.5 text-sm ${
                    r.member.id === me?.id ? "bg-accent-100" : ""
                  }`}
                >
                  <span className="w-6 text-center font-bold">
                    {r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : r.rank}
                  </span>
                  <span className="flex-1 truncate font-bold">{r.member.displayName}</span>
                  <span className="tabular-nums">{pts(r.net)} P</span>
                </li>
              ))}
              {board.length === 0 && <li className="text-sm text-ink-soft">Noch niemand dabei.</li>}
            </ol>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-xl font-semibold">Neueste Tipps</h2>
            <ul className="mt-3 space-y-3">
              {feed.slice(0, 8).map((f) => (
                <li key={f.id} className="text-sm">
                  <span className="font-bold">{f.memberName}</span>{" "}
                  {f.shares > 0 ? "setzt" : "verkauft"}{" "}
                  <span className="font-bold tabular-nums">{pts(Math.abs(f.cost))} P</span>{" "}
                  {f.shares > 0 ? "auf" : "von"}{" "}
                  <span className="font-bold text-accent-600">{f.outcomeLabel}</span>
                  <span className="block text-xs text-ink-soft">{timeAgo(f.createdAt)}</span>
                </li>
              ))}
              {feed.length === 0 && (
                <li className="text-sm text-ink-soft">Noch keine Tipps. Mach den Anfang!</li>
              )}
            </ul>
          </section>

          {!pool.premium && <AdSlot slug={slug} />}
          <GiftIdeas seed={pool.id} />
        </aside>
      </div>
    </main>
  );
}

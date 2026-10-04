import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Confetti } from "@/components/confetti";
import { CopyField, ShareButtons } from "@/components/share";
import { siteUrl } from "@/lib/billing";
import { getPoolView, isAdmin } from "@/lib/pools";
import { getDeviceId } from "@/lib/session";

export const metadata: Metadata = { title: "Einladen" };

export default async function InvitePage({ params, searchParams }: PageProps<"/p/[slug]/einladen">) {
  const { slug } = await params;
  const { neu } = await searchParams;
  const view = await getPoolView(slug, await getDeviceId());
  if (!view) notFound();
  const { pool, me, members } = view;
  if (!me) redirect(`/p/${slug}`);

  const isNew = neu === "1";
  const admin = isAdmin(pool, me);
  const base = siteUrl();
  const inviteUrl = `${base}/p/${slug}?ref=${me.id}`;
  const hostUrl = `${base}/p/${slug}?key=${pool.adminKey}`;
  const invited = members.filter((m) => m.invitedBy === me.id).length;
  const text = `👶 ${pool.parentNames ? `${pool.parentNames} bekommen ein Baby! ` : ""}Junge oder Mädchen? Welcher Name? Tipp mit bei der Babywette für ${pool.babyName}:`;

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      {isNew && <Confetti />}
      <div className="text-center">
        <div className="text-5xl">{isNew ? "🎉" : "💌"}</div>
        <h1 className="mt-3 font-display text-4xl font-semibold text-balance">
          {isNew ? "Eure Babywette ist startklar!" : "Lade deine Leute ein"}
        </h1>
        <p className="mt-3 text-ink-soft">
          {isNew
            ? "Letzter Schritt: Schick den Link in die Familien- oder Freundesgruppe. Je mehr mitmachen, desto spannender werden die Quoten."
            : `Für jede Person, die über deinen Link mitmacht, bekommst du ${pool.inviteBonus} Bonuspunkte.`}
        </p>
      </div>

      <section className="card mt-8 p-6">
        <h2 className="font-display text-xl font-semibold">Dein Einladungslink</h2>
        <ShareButtons url={inviteUrl} text={text} />
        <div className="mt-5">
          <CopyField label="Link" value={inviteUrl} />
        </div>
        <p className="mt-4 text-sm text-ink-soft">
          Schon {invited} {invited === 1 ? "Person" : "Personen"} über dich dabei
          {invited > 0 ? ` (+${invited * pool.inviteBonus} Punkte)` : ""}.
        </p>
      </section>

      {admin && (
        <section className="card mt-6 border-sun-200 bg-sun-50 p-6">
          <h2 className="font-display text-xl font-semibold">🔑 Gastgeber-Link</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {me.role === "parent"
              ? "Damit kann auch dein Partner oder deine Partnerin die Babywette verwalten und nach der Geburt auflösen. Nicht in die Gruppe posten!"
              : "Gib diesen Link an die Eltern weiter. Damit können sie die Babywette verwalten und nach der Geburt auflösen. Nicht in die Gruppe posten!"}
          </p>
          <div className="mt-4">
            <CopyField label="Nur für Gastgeber" value={hostUrl} />
          </div>
        </section>
      )}

      <div className="mt-8 text-center">
        <Link href={`/p/${slug}`} className="btn-primary">
          {isNew ? "Zur Babywette" : "Zurück zu den Wetten"}
        </Link>
      </div>
    </main>
  );
}

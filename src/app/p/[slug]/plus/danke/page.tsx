import Link from "next/link";
import { notFound } from "next/navigation";
import { Confetti } from "@/components/confetti";
import { BRAND } from "@/lib/brand";
import { getPool } from "@/lib/pools";
import { fulfilCheckout } from "@/lib/plus";

export default async function ThanksPage({ params, searchParams }: PageProps<"/p/[slug]/plus/danke">) {
  const { slug } = await params;
  const { session_id } = await searchParams;
  // Confirm on return as well as via webhook, so Plus is live immediately.
  if (typeof session_id === "string") await fulfilCheckout(session_id);
  const pool = await getPool(slug);
  if (!pool) notFound();

  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      {pool.premium && <Confetti />}
      <div className="text-5xl">{pool.premium ? "💛" : "⏳"}</div>
      <h1 className="mt-4 font-display text-3xl font-semibold">
        {pool.premium ? `${BRAND.plusName} ist aktiv!` : "Zahlung wird bestätigt …"}
      </h1>
      <p className="mt-2 text-ink-soft">
        {pool.premium
          ? "Danke! Eigene Fragen, Farbwelten und der Live-Modus sind jetzt freigeschaltet."
          : "Das dauert meist nur ein paar Sekunden. Lade die Seite gleich neu."}
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Link href={`/p/${slug}/verwalten`} className="btn-primary">Zum Verwalten</Link>
        {pool.premium && <Link href={`/p/${slug}/live`} className="btn-soft">Live-Modus</Link>}
      </div>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { LogoMark } from "@/components/logo";
import { pts } from "@/lib/format";
import { getPoolView, isAdmin } from "@/lib/pools";
import { getDeviceId } from "@/lib/session";
import { BRAND } from "@/lib/brand";

export default async function PoolLayout({
  children,
  params,
}: LayoutProps<"/p/[slug]">) {
  const { slug } = await params;
  const view = await getPoolView(slug, await getDeviceId());
  if (!view) notFound();
  const { pool, me } = view;
  const admin = isAdmin(pool, me);

  return (
    <div data-theme={pool.theme} className="flex min-h-screen flex-col bg-accent-50/40">
      <header className="sticky top-0 z-30 border-b border-line/60 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href="/" aria-label={`${BRAND.name} Startseite`}>
            <LogoMark className="size-8" />
          </Link>
          <Link href={`/p/${slug}`} className="min-w-0 flex-1 truncate font-display text-lg font-semibold">
            {pool.babyName}
          </Link>
          <nav className="flex items-center gap-1 text-sm font-bold">
            {me && (
              <Link href={`/p/${slug}/einladen`} className="rounded-full px-3 py-2 hover:bg-accent-100">
                Einladen
              </Link>
            )}
            {admin && (
              <Link href={`/p/${slug}/verwalten`} className="rounded-full px-3 py-2 hover:bg-accent-100">
                Verwalten
              </Link>
            )}
            {me && me.role !== "parent" && (
              <span
                className="ml-1 rounded-full bg-ink px-3 py-1.5 text-white tabular-nums"
                title="Deine freien Spielpunkte"
              >
                {pts(me.balance)} P
              </span>
            )}
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

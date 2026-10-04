"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect } from "react";
import { BRAND } from "@/lib/brand";

const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * One calm ad unit, only on free pools. Without AdSense configured it shows
 * a house ad for Namer Plus instead, so the space still earns its keep.
 */
export function AdSlot({ slug }: { slug: string }) {
  useEffect(() => {
    if (client && slot) (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  if (client && slot)
    return (
      <div className="card overflow-hidden p-3">
        <p className="mb-2 text-[10px] font-bold tracking-wide text-ink-soft uppercase">
          Anzeige
        </p>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ins
          className="adsbygoogle block"
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );

  return (
    <Link
      href={`/p/${slug}/plus`}
      className="card block bg-gradient-to-br from-sun-50 to-blush-50 p-5 transition hover:shadow-lift"
    >
      <p className="text-[10px] font-bold tracking-wide text-ink-soft uppercase">
        {BRAND.plusName}
      </p>
      <p className="mt-1 font-display text-lg font-semibold">
        Babyparty geplant? 🎈
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        Mit dem Live-Modus laufen die Quoten groß auf dem Fernseher mit. Dazu
        eigene Wetten und keine Werbung.
      </p>
    </Link>
  );
}

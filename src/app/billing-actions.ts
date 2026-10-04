"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { pools } from "@/lib/db/schema";
import {
  PLUS_PRICE_CENTS,
  demoBilling,
  siteUrl,
  stripe,
} from "@/lib/billing";
import { getPool } from "@/lib/pools";
import { BRAND } from "@/lib/brand";

export async function startPlusCheckout(form: FormData) {
  const pool = await getPool(String(form.get("slug") ?? ""));
  if (!pool) redirect("/");
  if (pool.premium) redirect(`/p/${pool.slug}/verwalten`);

  if (demoBilling) {
    await db.update(pools).set({ premium: true }).where(eq(pools.id, pool.id));
    redirect(`/p/${pool.slug}/plus/danke`);
  }
  if (!stripe) redirect(`/p/${pool.slug}/plus?fehler=1`);

  const base = siteUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: PLUS_PRICE_CENTS,
          product_data: {
            name: `${BRAND.plusName} für ${pool.babyName}`,
            description:
              "Eigene Wetten, Live-Modus für die Party, Farbwelten, keine Werbung.",
          },
        },
      },
    ],
    metadata: { poolId: pool.id },
    success_url: `${base}/p/${pool.slug}/plus/danke?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/p/${pool.slug}/plus`,
  });
  redirect(session.url!);
}

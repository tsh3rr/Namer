import "server-only";
import Stripe from "stripe";

export const PLUS_PRICE_CENTS = 999;
export const PLUS_PRICE_LABEL = "9,99 €";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * Without Stripe keys, local development unlocks Plus instantly so the
 * premium features can be tried out. Production never does.
 */
export const demoBilling = !stripe && process.env.NODE_ENV !== "production";

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  );
}

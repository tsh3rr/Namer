import "server-only";
import { eq } from "drizzle-orm";
import { stripe } from "./billing";
import { db } from "./db";
import { pools } from "./db/schema";

/** Mark a pool as Plus if the Stripe Checkout session is paid. Idempotent. */
export async function fulfilCheckout(sessionId: string) {
  if (!stripe) return null;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const poolId = session.metadata?.poolId;
  if (session.payment_status !== "paid" || !poolId) return null;
  await db.update(pools).set({ premium: true }).where(eq(pools.id, poolId));
  return poolId;
}

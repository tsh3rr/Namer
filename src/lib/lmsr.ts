/**
 * Logarithmic Market Scoring Rule (Hanson). Gives Polymarket-style prices that
 * always sum to 1 and move with every trade, with no counterparty needed —
 * perfect for a small group of friends where order books would be empty.
 *
 * A winning share pays out 1 point, so a price of 0.62 means "62 % chance"
 * and costs ~0.62 points per share.
 */

function logSumExp(xs: number[]): number {
  const max = Math.max(...xs);
  return max + Math.log(xs.reduce((s, x) => s + Math.exp(x - max), 0));
}

export function cost(q: number[], b: number): number {
  return b * logSumExp(q.map((x) => x / b));
}

export function prices(q: number[], b: number): number[] {
  const scaled = q.map((x) => x / b);
  const lse = logSumExp(scaled);
  return scaled.map((x) => Math.exp(x - lse));
}

/** Shares of outcome `i` you receive for spending `amount` points. */
export function sharesForAmount(
  q: number[],
  b: number,
  i: number,
  amount: number,
): number {
  if (amount <= 0) return 0;
  // Closed form of cost(q + x·e_i) − cost(q) = amount, solved for x:
  // x = b · ln( (S·(e^{A/b} − 1) + S_i) / S_i ), computed in log space.
  const scaled = q.map((x) => x / b);
  const lse = logSumExp(scaled);
  const logPi = scaled[i] - lse; // ln(S_i / S)
  const a = amount / b;
  // ln((e^{a} − 1) / p_i + 1)
  const logRatio = a + Math.log1p(-Math.exp(-a)) - logPi;
  return b * logAddExp(logRatio, 0);
}

/** Points received for selling `shares` of outcome `i` back to the market. */
export function proceedsForShares(
  q: number[],
  b: number,
  i: number,
  shares: number,
): number {
  if (shares <= 0) return 0;
  const after = q.slice();
  after[i] -= shares;
  return cost(q, b) - cost(after, b);
}

/** Points needed to buy exactly `shares` of outcome `i`. */
export function costForShares(
  q: number[],
  b: number,
  i: number,
  shares: number,
): number {
  const after = q.slice();
  after[i] += shares;
  return cost(after, b) - cost(q, b);
}

function logAddExp(a: number, b: number): number {
  const m = Math.max(a, b);
  return m + Math.log(Math.exp(a - m) + Math.exp(b - m));
}

/** Decimal odds ("Quote") for a price, e.g. 0.25 → 4.0. */
export function decimalOdds(price: number): number {
  return price > 0 ? 1 / price : Infinity;
}

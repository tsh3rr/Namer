import { describe, expect, it } from "vitest";
import {
  cost,
  costForShares,
  prices,
  proceedsForShares,
  sharesForAmount,
} from "../src/lib/lmsr";

describe("lmsr", () => {
  it("starts with uniform prices that sum to 1", () => {
    const p = prices([0, 0, 0, 0], 100);
    p.forEach((x) => expect(x).toBeCloseTo(0.25));
  });

  it("buying an outcome raises its price", () => {
    const q = [0, 0];
    const x = sharesForAmount(q, 100, 0, 50);
    const p = prices([x, 0], 100);
    expect(p[0]).toBeGreaterThan(0.5);
    expect(p[0] + p[1]).toBeCloseTo(1);
  });

  it("sharesForAmount is the inverse of costForShares", () => {
    const q = [120, -30, 45];
    for (const amount of [0.5, 10, 250, 5000]) {
      const x = sharesForAmount(q, 150, 1, amount);
      expect(costForShares(q, 150, 1, x)).toBeCloseTo(amount, 6);
    }
  });

  it("buying then selling the same shares round-trips", () => {
    const q = [10, 20];
    const x = sharesForAmount(q, 100, 0, 80);
    const after = [q[0] + x, q[1]];
    expect(proceedsForShares(after, 100, 0, x)).toBeCloseTo(80, 6);
  });

  it("stays numerically stable for lopsided markets", () => {
    const q = [5000, 0];
    expect(Number.isFinite(cost(q, 100))).toBe(true);
    const x = sharesForAmount(q, 100, 1, 10);
    expect(Number.isFinite(x)).toBe(true);
    expect(x).toBeGreaterThan(10); // the underdog is cheap
  });
});

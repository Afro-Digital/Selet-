import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { money, add, subtract, allocate } from './money';
import { priceFromMargin, marginFromPrice } from './margin';
import { createBalancerLine, lockBlended } from './margin-balancer';

describe('Pricing Engine Invariants (Property-Based Tests)', () => {
  it('Allocation Invariant: Sum of allocated shares always equals total amount without losing a single minor unit', () => {
    fc.assert(
      fc.property(
        // Total amount between 1 and 100,000,000 minor units
        fc.bigInt({ min: 1n, max: 100_000_000n }),
        // Array of 1 to 10 integer ratios between 1 and 100
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 10 }),
        (totalAmount, ratios) => {
          const totalMoney = money(totalAmount, 'ETB');
          const shares = allocate(totalMoney, ratios);

          // Invariant 1: Number of shares matches number of ratios
          expect(shares.length).toBe(ratios.length);

          // Invariant 2: Sum of allocated shares equals the original total exactly
          const sumShares = shares.reduce((acc, s) => acc + s.amount, 0n);
          expect(sumShares).toBe(totalAmount);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('Round-Trip Invariant: marginFromPrice(cost, priceFromMargin(cost, margin)) recovers the original margin within precision', () => {
    fc.assert(
      fc.property(
        // Cost between 1,000 and 10,000,000 minor units
        fc.bigInt({ min: 1000n, max: 10_000_000n }),
        // Margin between 0.01 (1%) and 0.85 (85%)
        fc.double({ min: 0.01, max: 0.85, noNaN: true }),
        (costAmount, margin) => {
          const cost = money(costAmount, 'ETB');
          const price = priceFromMargin(cost, margin);

          // Price must be strictly greater than cost
          expect(price.amount).toBeGreaterThan(cost.amount);

          // Recover margin
          const recoveredMargin = marginFromPrice(cost, price);
          // Due to rounding to integer minor units, recovered margin is within 0.005 (0.5%)
          expect(recoveredMargin).toBeCloseTo(margin, 2);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('Blended Margin Invariant: When lockBlended is feasible, actual blended margin matches target', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 5000 }), // Cost A in ETB
        fc.integer({ min: 1000, max: 5000 }), // Cost B in ETB
        fc.double({ min: 0.15, max: 0.35, noNaN: true }), // Initial Margin A
        fc.double({ min: 0.15, max: 0.35, noNaN: true }), // Initial Margin B
        fc.double({ min: 0.1, max: 0.2, noNaN: true }), // New Margin A
        fc.double({ min: 0.25, max: 0.35, noNaN: true }), // Target Blended Margin
        (costA, costB, marginA, marginB, newMarginA, targetBlended) => {
          const lineA = createBalancerLine('a', 'A', money(BigInt(costA) * 100n, 'ETB'), marginA, {
            floorMargin: 0.05,
            ceilingMargin: 0.9,
          });
          const lineB = createBalancerLine('b', 'B', money(BigInt(costB) * 100n, 'ETB'), marginB, {
            floorMargin: 0.05,
            ceilingMargin: 0.9,
          });

          const result = lockBlended([lineA, lineB], 'a', newMarginA, targetBlended);

          if (result.isFeasible) {
            expect(result.blendedMargin).toBeCloseTo(targetBlended, 2);
          }
        },
      ),
      { numRuns: 50 },
    );
  });

  it('Money Addition: Associativity and Commutativity hold for Money', () => {
    fc.assert(
      fc.property(
        fc.bigInt({ min: 0n, max: 1_000_000n }),
        fc.bigInt({ min: 0n, max: 1_000_000n }),
        (a, b) => {
          const m1 = money(a, 'ETB');
          const m2 = money(b, 'ETB');

          // Commutativity: a + b === b + a
          expect(add(m1, m2).amount).toBe(add(m2, m1).amount);
          // Inverse: (a + b) - b === a
          expect(subtract(add(m1, m2), m2).amount).toBe(m1.amount);
        },
      ),
      { numRuns: 100 },
    );
  });
});

import { describe, it, expect } from 'vitest';
import { money } from './money';
import {
  createBalancerLine,
  summarizeLines,
  lockBlended,
  targetPriceMode,
  applyDiscount,
} from './margin-balancer';

describe('Margin Balancer', () => {
  it('locks blended margin and shifts margin to balancing line', () => {
    // Line A: Cost 2,000 ETB, Margin 25% -> Price = 2,000 / 0.75 = 2,666.67 ETB
    // Line B: Cost 2,000 ETB, Margin 35% -> Price = 2,000 / 0.65 = 3,076.92 ETB
    // Total Cost = 4,000 ETB, Target Blended Margin = 30% -> Total Price = 4,000 / 0.70 = 5,714.29 ETB
    // User lowers Line A margin to 20%:
    // Line A Price becomes 2,000 / 0.80 = 2,500.00 ETB
    // Line B must absorb the difference: Line B Price = 5,714.29 - 2,500 = 3,214.29 ETB
    // Line B new margin = 1 - 2,000 / 3,214.29 = 37.78%
    const lineA = createBalancerLine('line-a', 'Module A', money(200000n, 'ETB'), 0.25, {
      floorMargin: 0.15,
      ceilingMargin: 0.6,
    });
    const lineB = createBalancerLine('line-b', 'Module B', money(200000n, 'ETB'), 0.35, {
      floorMargin: 0.15,
      ceilingMargin: 0.6,
    });

    const summary = summarizeLines([lineA, lineB]);
    expect(summary.totalCost.amount).toBe(400000n);
    expect(summary.blendedMargin).toBeGreaterThan(0.25);

    const result = lockBlended([lineA, lineB], 'line-a', 0.2, 0.3);

    expect(result.isFeasible).toBe(true);
    expect(result.blendedMargin).toBeCloseTo(0.3, 3);
    const updatedA = result.lines.find((l) => l.id === 'line-a')!;
    const updatedB = result.lines.find((l) => l.id === 'line-b')!;
    expect(updatedA.margin).toBe(0.2);
    expect(updatedB.margin).toBeGreaterThan(0.35); // Raised to compensate
  });

  it('detects infeasibility when balancing lines break ceiling or floor guardrails', () => {
    // If Line B has ceiling 30%, but keeping blended 30% requires raising it to 38%, it should flag infeasible
    const lineA = createBalancerLine('line-a', 'Module A', money(200000n, 'ETB'), 0.25);
    const lineB = createBalancerLine('line-b', 'Module B', money(200000n, 'ETB'), 0.25, {
      ceilingMargin: 0.3, // strict ceiling
    });

    const result = lockBlended([lineA, lineB], 'line-a', 0.1, 0.3);
    expect(result.isFeasible).toBe(false);
    expect(result.violations?.length).toBeGreaterThan(0);
    expect(result.violations?.[0]?.boundType).toBe('CEILING');
  });

  it('evaluates target price (client budget) mode', () => {
    const lineA = createBalancerLine('line-a', 'Module A', money(200000n, 'ETB'), 0.3);
    const lineB = createBalancerLine('line-b', 'Module B', money(200000n, 'ETB'), 0.3);

    // Total cost = 4,000 ETB. Client budget = 5,000 ETB.
    // Resulting blended margin = (5,000 - 4,000) / 5,000 = 20%
    const result = targetPriceMode([lineA, lineB], money(500000n, 'ETB'), 0.15);
    expect(result.isFeasible).toBe(true);
    expect(result.blendedMargin).toBeCloseTo(0.2, 4);

    // If client budget is below floor margin (e.g. floor is 25%):
    const tightResult = targetPriceMode([lineA, lineB], money(500000n, 'ETB'), 0.25);
    expect(tightResult.isFeasible).toBe(false);
  });

  it('applies what-if discount to total and recalculates profit and blended margin', () => {
    const lineA = createBalancerLine('line-a', 'Module A', money(200000n, 'ETB'), 0.3); // price 285,714
    const lineB = createBalancerLine('line-b', 'Module B', money(200000n, 'ETB'), 0.3); // price 285,714

    // 10% discount on total
    const discounted = applyDiscount([lineA, lineB], 0.1, undefined, 0.2);
    expect(discounted.blendedMargin).toBeLessThan(0.3);
    expect(discounted.isFeasible).toBe(true);
  });
});

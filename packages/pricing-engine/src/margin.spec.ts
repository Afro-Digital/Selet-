import { describe, it, expect } from 'vitest';
import { money } from './money';
import {
  priceFromMargin,
  marginFromPrice,
  profitFromPrice,
  calculatePriceRange,
  InvalidMarginError,
} from './margin';

describe('Margin and Pricing formulas', () => {
  it('calculates price from margin: price = cost / (1 - margin)', () => {
    // Example from spec: cost 4,000 and margin 30% gives price 5,714.29, not 5,200
    const cost = money(400000n, 'ETB'); // 4,000.00 ETB
    const price = priceFromMargin(cost, 0.3);
    expect(price.amount).toBe(571429n); // 5,714.29 ETB
    expect(profitFromPrice(cost, price).amount).toBe(171429n); // 1,714.29 ETB profit
  });

  it('calculates margin on price accurately', () => {
    const cost = money(400000n, 'ETB');
    const price = money(571429n, 'ETB');
    const margin = marginFromPrice(cost, price);
    expect(margin).toBeCloseTo(0.3, 4);
  });

  it('rejects margins >= 100% or negative', () => {
    const cost = money(1000n, 'ETB');
    expect(() => priceFromMargin(cost, 1.0)).toThrow(InvalidMarginError);
    expect(() => priceFromMargin(cost, 1.2)).toThrow(InvalidMarginError);
    expect(() => priceFromMargin(cost, -0.05)).toThrow(InvalidMarginError);
  });

  it('calculates 3-tier price range and market comparison flags', () => {
    const range = calculatePriceRange({
      optimisticCost: money(300000n, 'ETB'), // 3,000 ETB
      likelyCost: money(400000n, 'ETB'), // 4,000 ETB
      pessimisticCost: money(600000n, 'ETB'), // 6,000 ETB
      minimumMargin: 0.2, // 3000 / 0.8 = 3750 ETB
      targetMargin: 0.3, // 4000 / 0.7 = 5714.29 ETB
      stretchMargin: 0.4, // 6000 / 0.6 = 10000 ETB
      marketMin: money(500000n, 'ETB'), // 5,000 ETB
      marketMax: money(800000n, 'ETB'), // 8,000 ETB
    });

    expect(range.low.price.amount).toBe(375000n);
    expect(range.recommended.price.amount).toBe(571429n);
    expect(range.high.price.amount).toBe(1000000n);

    expect(range.marketComparison?.isWithinMarket).toBe(true);
    expect(range.marketComparison?.isBelowMarket).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { threePointHours, aggregateThreePointEstimates } from './pert';

describe('PERT estimation', () => {
  it('calculates expected hours: (O + 4L + P) / 6', () => {
    // O = 10, L = 20, P = 36
    // Expected = (10 + 4*20 + 36) / 6 = (10 + 80 + 36) / 6 = 126 / 6 = 21
    const result = threePointHours(10, 20, 36);
    expect(result.optimistic).toBe(10);
    expect(result.likely).toBe(20);
    expect(result.pessimistic).toBe(36);
    expect(result.expected).toBe(21);
  });

  it('rejects invalid O > L or L > P ordering', () => {
    expect(() => threePointHours(25, 20, 30)).toThrow();
    expect(() => threePointHours(10, 25, 20)).toThrow();
  });

  it('aggregates multiple three-point estimates', () => {
    const estimates = [
      { optimistic: 5, likely: 10, pessimistic: 21 }, // (5 + 40 + 21)/6 = 11
      { optimistic: 10, likely: 15, pessimistic: 26 }, // (10 + 60 + 26)/6 = 16
    ];
    // Total: O=15, L=25, P=47 -> (15 + 100 + 47)/6 = 162/6 = 27
    const agg = aggregateThreePointEstimates(estimates);
    expect(agg.optimistic).toBe(15);
    expect(agg.likely).toBe(25);
    expect(agg.pessimistic).toBe(47);
    expect(agg.expected).toBe(27);
  });
});

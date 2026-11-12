import { describe, it, expect } from 'vitest';
import { PRICING_ENGINE_VERSION, priceFromMargin, getEngineInfo } from './index';

describe('Pricing Engine', () => {
  it('reports the correct version', () => {
    expect(PRICING_ENGINE_VERSION).toBe('0.1.0');
    expect(getEngineInfo()).toContain('Selet Pricing Engine');
  });

  it('calculates price from cost and margin: price = cost / (1 - margin)', () => {
    // 4000 ETB at 30% margin = 4000 / 0.7 = 5714.2857... -> 5714.29 ETB (571429 santim)
    expect(priceFromMargin(400000, 0.3).amount).toBe(571429n);
  });

  it('throws on invalid margin values', () => {
    expect(() => priceFromMargin(100, 1.0)).toThrow();
    expect(() => priceFromMargin(100, -0.1)).toThrow();
  });
});

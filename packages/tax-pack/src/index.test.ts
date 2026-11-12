import { describe, it, expect } from 'vitest';
import { TAX_PACK_VERSION, TaxRuleSchema } from './index';

describe('Tax Pack', () => {
  it('has valid version', () => {
    expect(TAX_PACK_VERSION).toBe('0.1.0');
  });

  it('validates a tax rule schema', () => {
    const validRule = {
      id: 'vat-standard',
      name: 'VAT',
      rate: 0.15,
      effectiveFrom: '2026-01-01',
      source: 'https://example.com/vat',
      verifiedAt: '2026-11-12',
      needsVerification: false,
    };
    const parsed = TaxRuleSchema.parse(validRule);
    expect(parsed.rate).toBe(0.15);
  });
});

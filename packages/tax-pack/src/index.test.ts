import { describe, it, expect } from 'vitest';
import { TAX_PACK_VERSION, TaxRuleSchema, ethiopia2026TaxPack } from './index';

describe('Tax Pack', () => {
  it('has valid version', () => {
    expect(TAX_PACK_VERSION).toBe('2026.1');
    expect(ethiopia2026TaxPack.version).toBe('2026.1');
  });

  it('validates a tax rule schema', () => {
    const validRule = {
      id: 'vat-standard',
      name: 'VAT',
      type: 'VAT',
      appliesTo: 'QUOTE',
      rate: 0.15,
      sourceUrl: 'https://example.com/vat',
      verifiedAt: '2026-11-12',
      needsVerification: false,
    };
    const parsed = TaxRuleSchema.parse(validRule);
    expect(parsed.rate).toBe(0.15);
  });
});

import { describe, it, expect } from 'vitest';
import { validateTaxPack, loadTaxPack } from './validator';
import rawEthiopia2026 from './packs/ethiopia-2026.json';

describe('Tax Pack Validator', () => {
  it('validates the official ethiopia-2026.json pack with zero errors', () => {
    const result = validateTaxPack(rawEthiopia2026);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe('ET');
      expect(result.data.currency).toBe('ETB');
      expect(result.data.rules.length).toBeGreaterThanOrEqual(7);
    }
  });

  it('rejects a tax rule with missing sourceUrl', () => {
    const invalidPack = {
      ...rawEthiopia2026,
      rules: [
        {
          ...rawEthiopia2026.rules[0],
          sourceUrl: '', // empty sourceUrl
        },
      ],
    };

    const result = validateTaxPack(invalidPack);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('sourceUrl'))).toBe(true);
    }
  });

  it('rejects a tax rule with missing or invalid verifiedAt date format', () => {
    const invalidPack = {
      ...rawEthiopia2026,
      rules: [
        {
          ...rawEthiopia2026.rules[0],
          verifiedAt: 'not-a-date',
        },
      ],
    };

    const result = validateTaxPack(invalidPack);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('verifiedAt'))).toBe(true);
    }
  });

  it('rejects a tax rule that has neither rate nor brackets', () => {
    const invalidPack = {
      ...rawEthiopia2026,
      rules: [
        {
          id: 'invalid-rule',
          name: 'Invalid Rule',
          type: 'VAT',
          appliesTo: 'QUOTE',
          sourceUrl: 'https://example.com',
          verifiedAt: '2026-01-01',
          // no rate, no brackets
        },
      ],
    };

    const result = validateTaxPack(invalidPack);
    expect(result.success).toBe(false);
  });

  it('rejects a tax rule with inverted bracket bounds', () => {
    const invalidPack = {
      ...rawEthiopia2026,
      rules: [
        {
          id: 'inverted-brackets',
          name: 'Inverted Brackets',
          type: 'PAYE',
          appliesTo: 'PAYROLL',
          sourceUrl: 'https://example.com',
          verifiedAt: '2026-01-01',
          brackets: [
            {
              minMinor: 500000,
              maxMinor: 200000, // min > max!
              rate: 0.1,
              deductionMinor: 0,
            },
          ],
        },
      ],
    };

    const result = validateTaxPack(invalidPack);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('minMinor'))).toBe(true);
    }
  });

  it('rejects duplicate rule IDs', () => {
    const invalidPack = {
      ...rawEthiopia2026,
      rules: [rawEthiopia2026.rules[0], rawEthiopia2026.rules[0]],
    };

    const result = validateTaxPack(invalidPack);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true);
    }
  });

  it('throws descriptive error in loadTaxPack on failure', () => {
    expect(() => loadTaxPack({ invalid: 'object' })).toThrow(/Tax pack validation failed/);
  });
});

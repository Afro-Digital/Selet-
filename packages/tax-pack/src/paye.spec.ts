import { describe, it, expect } from 'vitest';
import { ethiopia2026TaxPack } from './index';
import { calculatePayeTax } from './paye';

describe('Ethiopian PAYE Calculation', () => {
  const payeRule = ethiopia2026TaxPack.rules.find((r) => r.type === 'PAYE')!;
  const brackets = payeRule.brackets!;

  it('exempts salary below or equal to tax-free threshold (ETB 2,000 / 200,000 santim)', () => {
    // ETB 1,800
    const res = calculatePayeTax(180000, brackets);
    expect(res.totalTaxMinor).toBe(0);
    expect(res.effectiveRate).toBe(0);

    // Exactly ETB 2,000
    const res2 = calculatePayeTax(200000, brackets);
    expect(res2.totalTaxMinor).toBe(0);
    expect(res2.effectiveRate).toBe(0);
  });

  it('calculates tax correctly for second tier (ETB 3,000)', () => {
    // Salary = 3,000 ETB (300,000 santim)
    // 0 - 2,000 ETB: 0% = 0
    // 2,000 - 3,000 ETB: 1,000 ETB at 10% = 100 ETB (10,000 santim)
    const res = calculatePayeTax(300000, brackets);
    expect(res.totalTaxMinor).toBe(10000); // 100 ETB
    expect(res.effectiveRate).toBeCloseTo(100 / 3000, 4); // ~3.33%
  });

  it('calculates progressive tax for senior developer salary (ETB 35,000)', () => {
    // Salary = 35,000 ETB (3,500,000 santim)
    // Brackets:
    // 0 - 2,000: 0
    // 2,000 - 4,000: 2,000 * 10% = 200 ETB
    // 4,000 - 7,000: 3,000 * 15% = 450 ETB
    // 7,000 - 10,000: 3,000 * 20% = 600 ETB
    // 10,000 - 15,000: 5,000 * 25% = 1,250 ETB
    // 15,000 - 20,000: 5,000 * 30% = 1,500 ETB
    // Over 20,000: 15,000 * 35% = 5,250 ETB
    // Total Tax = 200 + 450 + 600 + 1250 + 1500 + 5250 = 9,250 ETB (925,000 santim)
    const res = calculatePayeTax(3500000, brackets);
    expect(res.totalTaxMinor).toBe(925000);
    expect(res.effectiveRate).toBeCloseTo(9250 / 35000, 4); // ~26.43%
  });
});

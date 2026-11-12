import { describe, it, expect } from 'vitest';
import { hourlyCost } from './hourly-cost';

describe('Hourly Cost calculation', () => {
  it('calculates hourly cost for an Ethiopian national with standard POESSA 11% pension', () => {
    // Basic: 30,000 ETB (3,000,000 santim)
    // Allowances: 5,000 ETB (500,000 santim)
    // Pension 11% on basic: 3,300 ETB (330,000 santim)
    // Total monthly = 38,300 ETB (3,830,000 santim)
    // Productive hours = 160 * 0.70 = 112 hours
    // Hourly = 38,300 / 112 = 341.964... ETB -> 34,196 santim
    const result = hourlyCost({
      payType: 'MONTHLY_SALARY',
      currency: 'ETB',
      basicSalaryMinor: 3000000n,
      allowancesMinor: 500000n,
      paidHoursPerMonth: 160,
      utilizationRate: 0.7,
      isEthiopianNational: true,
      pensionRate: 0.11,
      pensionBase: 'BASIC',
    });

    expect(result.monthlyEmployerPension.amount).toBe(330000n);
    expect(result.totalMonthlyCost.amount).toBe(3830000n);
    expect(result.productiveHoursPerMonth).toBe(112);
    expect(result.hourlyCost.amount).toBe(34196n); // 341.96 ETB
  });

  it('exempts foreign nationals from POESSA pension', () => {
    const result = hourlyCost({
      payType: 'MONTHLY_SALARY',
      currency: 'ETB',
      basicSalaryMinor: 3000000n,
      allowancesMinor: 500000n,
      paidHoursPerMonth: 160,
      utilizationRate: 0.7,
      isEthiopianNational: false,
    });

    expect(result.monthlyEmployerPension.amount).toBe(0n);
    expect(result.totalMonthlyCost.amount).toBe(3500000n);
    // 3,500,000 / 112 = 31,250 santim (312.50 ETB)
    expect(result.hourlyCost.amount).toBe(31250n);
  });

  it('applies pension ceiling when configured', () => {
    const result = hourlyCost({
      payType: 'MONTHLY_SALARY',
      currency: 'ETB',
      basicSalaryMinor: 5000000n, // 50,000 ETB
      pensionCeilingMinor: 1500000n, // 15,000 ETB ceiling
      isEthiopianNational: true,
      pensionRate: 0.11,
    });

    // Pension on ceiling 15,000 = 1,650 ETB (165,000 santim)
    expect(result.monthlyEmployerPension.amount).toBe(165000n);
  });

  it('handles direct hourly and contractor rates', () => {
    const result = hourlyCost({
      payType: 'CONTRACTOR',
      currency: 'USD',
      directHourlyRateMinor: 5000n, // $50.00
    });

    expect(result.hourlyCost.amount).toBe(5000n);
    expect(result.hourlyCost.currency).toBe('USD');
  });
});

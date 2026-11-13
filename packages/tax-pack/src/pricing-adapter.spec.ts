import { describe, it, expect } from 'vitest';
import {
  money,
  calculateQuoteTaxes,
  calculateOwnerProfitTax,
  hourlyCost,
} from '@selet/pricing-engine';
import { ethiopia2026TaxPack } from './index';
import { extractPricingTaxConfig } from './pricing-adapter';

describe('Pricing Engine & Tax Pack Integration', () => {
  it('supplies rates from TaxPack to pricing engine quote calculations', () => {
    const config = extractPricingTaxConfig(ethiopia2026TaxPack);
    expect(config.vatRate).toBe(0.15);
    expect(config.withholdingRate).toBe(0.03);
    expect(config.corporateTaxRate).toBe(0.3);
    expect(config.employerPensionRate).toBe(0.11);

    // Calculate quote taxes for 100,000 ETB
    const quoteTaxes = calculateQuoteTaxes(money(10000000n, 'ETB'), {
      vatRate: config.vatRate,
      withholdingRate: config.withholdingRate,
    });

    expect(quoteTaxes.vatAmount.amount).toBe(1500000n); // 15,000 ETB VAT
    expect(quoteTaxes.totalClientPayable.amount).toBe(11500000n); // 115,000 ETB total
    expect(quoteTaxes.withholdingAmount.amount).toBe(300000n); // 3,000 ETB withholding
    expect(quoteTaxes.netCashExpected.amount).toBe(11200000n); // 112,000 ETB expected cash
  });

  it('supplies rates from TaxPack to owner corporate profit tax estimation', () => {
    const config = extractPricingTaxConfig(ethiopia2026TaxPack);

    // Quote = 100,000 ETB, Cost = 60,000 ETB -> Profit = 40,000 ETB
    const ownerTaxes = calculateOwnerProfitTax(money(10000000n, 'ETB'), money(6000000n, 'ETB'), {
      corporateTaxRate: config.corporateTaxRate,
    });

    expect(ownerTaxes.grossProfit.amount).toBe(4000000n); // 40,000 ETB
    expect(ownerTaxes.corporateTaxEstimate.amount).toBe(1200000n); // 12,000 ETB
    expect(ownerTaxes.netProfitEstimate.amount).toBe(2800000n); // 28,000 ETB
  });

  it('supplies pension rate to hourly employee cost calculations', () => {
    const config = extractPricingTaxConfig(ethiopia2026TaxPack);

    const costResult = hourlyCost({
      payType: 'MONTHLY_SALARY',
      currency: 'ETB',
      basicSalaryMinor: 3000000n, // 30,000 ETB
      paidHoursPerMonth: 160,
      utilizationRate: 0.7,
      isEthiopianNational: true,
      pensionRate: config.employerPensionRate,
      pensionBase: config.employerPensionBase === 'GROSS_SALARY' ? 'GROSS' : 'BASIC',
    });

    // 11% of 30,000 = 3,300 ETB pension
    expect(costResult.monthlyEmployerPension.amount).toBe(330000n);
  });
});

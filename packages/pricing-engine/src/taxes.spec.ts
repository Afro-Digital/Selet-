import { describe, it, expect } from 'vitest';
import { money } from './money';
import { calculateQuoteTaxes, calculateOwnerProfitTax } from './taxes';

describe('Taxes helpers', () => {
  it('calculates quote taxes: 15% VAT on top, withholding deducted from cash flow', () => {
    // Price = 100,000 ETB (10,000,000 santim)
    // VAT 15% = 15,000 ETB (1,500,000 santim)
    // Client total payable = 115,000 ETB (11,500,000 santim)
    // Withholding 3% on price = 3,000 ETB (300,000 santim)
    // Expected cash collected = 115,000 - 3,000 = 112,000 ETB (11,200,000 santim)
    const quote = calculateQuoteTaxes(money(10000000n, 'ETB'), {
      vatRate: 0.15,
      withholdingRate: 0.03,
    });

    expect(quote.vatAmount.amount).toBe(1500000n);
    expect(quote.totalClientPayable.amount).toBe(11500000n);
    expect(quote.withholdingAmount.amount).toBe(300000n);
    expect(quote.netCashExpected.amount).toBe(11200000n);
  });

  it('calculates owner corporate profit tax estimate', () => {
    // Price = 100,000 ETB, Cost = 60,000 ETB
    // Profit = 40,000 ETB (4,000,000 santim)
    // Corporate tax 30% = 12,000 ETB (1,200,000 santim)
    // Net profit estimate = 28,000 ETB (2,800,000 santim)
    const breakdown = calculateOwnerProfitTax(money(10000000n, 'ETB'), money(6000000n, 'ETB'), {
      corporateTaxRate: 0.3,
    });

    expect(breakdown.grossProfit.amount).toBe(4000000n);
    expect(breakdown.corporateTaxEstimate.amount).toBe(1200000n);
    expect(breakdown.netProfitEstimate.amount).toBe(2800000n);
  });
});

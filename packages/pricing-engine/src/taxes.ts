import { Money, money, add, subtract, multiplyRational } from './money';

export interface TaxPackInput {
  vatRate?: number; // e.g. 0.15 for 15% standard Ethiopian VAT
  withholdingRate?: number; // e.g. 0.03 for 3% domestic withholding on services
  corporateTaxRate?: number; // e.g. 0.30 for 30% corporate profit tax
}

export interface QuoteTaxBreakdown {
  quotePrice: Money;
  vatRate: number;
  vatAmount: Money;
  totalClientPayable: Money; // quotePrice + vatAmount
  withholdingRate: number;
  withholdingAmount: Money; // withheld by client at payment
  netCashExpected: Money; // totalClientPayable - withholdingAmount
}

export interface OwnerTaxBreakdown {
  quotePrice: Money;
  projectCost: Money;
  grossProfit: Money;
  corporateTaxRate: number;
  corporateTaxEstimate: Money;
  netProfitEstimate: Money;
}

/**
 * Calculates client-facing VAT and cash-flow withholding for a quote.
 */
export function calculateQuoteTaxes(
  quotePrice: Money,
  rates: TaxPackInput = {},
): QuoteTaxBreakdown {
  const vatRate = rates.vatRate ?? 0.15;
  const withholdingRate = rates.withholdingRate ?? 0.03;

  // 1. VAT is added on top of the quote price
  const vatBps = BigInt(Math.round(vatRate * 10000));
  const vatAmount = multiplyRational(quotePrice, vatBps, 10000n);
  const totalClientPayable = add(quotePrice, vatAmount);

  // 2. Withholding is computed on the base service price (or gross subject to regulation)
  const withholdingBps = BigInt(Math.round(withholdingRate * 10000));
  const withholdingAmount = multiplyRational(quotePrice, withholdingBps, 10000n);

  // 3. Expected cash collected
  const netCashExpected = subtract(totalClientPayable, withholdingAmount);

  return {
    quotePrice,
    vatRate,
    vatAmount,
    totalClientPayable,
    withholdingRate,
    withholdingAmount,
    netCashExpected,
  };
}

/**
 * Calculates estimated profit tax for the internal owner view.
 */
export function calculateOwnerProfitTax(
  quotePrice: Money,
  projectCost: Money,
  rates: TaxPackInput = {},
): OwnerTaxBreakdown {
  const corporateTaxRate = rates.corporateTaxRate ?? 0.3;
  const grossProfit = subtract(quotePrice, projectCost);

  let corporateTaxEstimate: Money;
  let netProfitEstimate: Money;

  if (grossProfit.amount <= 0n) {
    corporateTaxEstimate = money(0n, quotePrice.currency);
    netProfitEstimate = grossProfit;
  } else {
    const corpBps = BigInt(Math.round(corporateTaxRate * 10000));
    corporateTaxEstimate = multiplyRational(grossProfit, corpBps, 10000n);
    netProfitEstimate = subtract(grossProfit, corporateTaxEstimate);
  }

  return {
    quotePrice,
    projectCost,
    grossProfit,
    corporateTaxRate,
    corporateTaxEstimate,
    netProfitEstimate,
  };
}

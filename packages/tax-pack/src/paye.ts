import { TaxBracket } from './schema';

export interface PayeBracketTierResult {
  tierIndex: number;
  rate: number;
  minMinor: number;
  maxMinor: number | null;
  taxableInTierMinor: number;
  taxInTierMinor: number;
}

export interface PayeCalculationResult {
  taxableSalaryMinor: number;
  totalTaxMinor: number;
  effectiveRate: number;
  tiers: PayeBracketTierResult[];
}

/**
 * Calculates progressive PAYE income tax given taxable salary in minor units (santim)
 * and ordered progressive tax brackets.
 */
export function calculatePayeTax(
  taxableSalaryMinor: number,
  brackets: TaxBracket[],
): PayeCalculationResult {
  if (taxableSalaryMinor <= 0) {
    return {
      taxableSalaryMinor,
      totalTaxMinor: 0,
      effectiveRate: 0,
      tiers: [],
    };
  }

  let totalTax = 0;
  const tiers: PayeBracketTierResult[] = [];

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i]!;

    if (taxableSalaryMinor <= bracket.minMinor) {
      break;
    }

    const tierCeiling = bracket.maxMinor !== null ? bracket.maxMinor : taxableSalaryMinor;
    const taxableInTier = Math.min(taxableSalaryMinor, tierCeiling) - bracket.minMinor;

    if (taxableInTier > 0) {
      const taxInTier = Math.round(taxableInTier * bracket.rate);
      totalTax += taxInTier;

      tiers.push({
        tierIndex: i,
        rate: bracket.rate,
        minMinor: bracket.minMinor,
        maxMinor: bracket.maxMinor,
        taxableInTierMinor: taxableInTier,
        taxInTierMinor: taxInTier,
      });
    }

    if (bracket.maxMinor !== null && taxableSalaryMinor <= bracket.maxMinor) {
      break;
    }
  }

  const effectiveRate = taxableSalaryMinor > 0 ? totalTax / taxableSalaryMinor : 0;

  return {
    taxableSalaryMinor,
    totalTaxMinor: totalTax,
    effectiveRate,
    tiers,
  };
}

import { TaxPack, TaxRule } from './schema';

export interface PricingTaxConfig {
  vatRate: number;
  vatRule?: TaxRule;
  withholdingRate: number;
  withholdingRule?: TaxRule;
  corporateTaxRate: number;
  corporateTaxRule?: TaxRule;
  employerPensionRate: number;
  employerPensionBase: 'BASIC_SALARY' | 'GROSS_SALARY';
  employerPensionRule?: TaxRule;
  employeePensionRate: number;
  employeePensionRule?: TaxRule;
  severanceAccrualRate: number;
  severanceRule?: TaxRule;
  isSeveranceEnabled: boolean;
}

/**
 * Extracts normalized calculation rates from a TaxPack for consumption by the pricing engine.
 */
export function extractPricingTaxConfig(taxPack: TaxPack): PricingTaxConfig {
  const vatRule = taxPack.rules.find((r) => r.type === 'VAT' && r.enabledByDefault !== false);
  const withholdingRule = taxPack.rules.find(
    (r) => r.type === 'WITHHOLDING' && r.enabledByDefault !== false,
  );
  const corporateTaxRule = taxPack.rules.find(
    (r) => r.type === 'CORPORATE_TAX' && r.enabledByDefault !== false,
  );
  const employerPensionRule = taxPack.rules.find(
    (r) => r.type === 'EMPLOYER_PENSION' && r.enabledByDefault !== false,
  );
  const employeePensionRule = taxPack.rules.find(
    (r) => r.type === 'EMPLOYEE_PENSION' && r.enabledByDefault !== false,
  );
  const severanceRule = taxPack.rules.find((r) => r.type === 'SEVERANCE');

  return {
    vatRate: vatRule?.rate ?? 0.15,
    vatRule,
    withholdingRate: withholdingRule?.rate ?? 0.03,
    withholdingRule,
    corporateTaxRate: corporateTaxRule?.rate ?? 0.3,
    corporateTaxRule,
    employerPensionRate: employerPensionRule?.rate ?? 0.11,
    employerPensionBase:
      employerPensionRule?.base === 'GROSS_SALARY' ? 'GROSS_SALARY' : 'BASIC_SALARY',
    employerPensionRule,
    employeePensionRate: employeePensionRule?.rate ?? 0.07,
    employeePensionRule,
    severanceAccrualRate: severanceRule?.rate ?? 0.0833,
    severanceRule,
    isSeveranceEnabled: severanceRule?.enabledByDefault === true,
  };
}

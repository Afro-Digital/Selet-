import { hourlyCost } from '@selet/pricing-engine';
import { Person, ComputedHourlyCost } from '../types';

export function computePersonCost(person: Person): ComputedHourlyCost {
  const result = hourlyCost({
    payType: person.payType,
    currency: person.currency || 'ETB',
    basicSalaryMinor: person.basicSalaryMinor ? BigInt(person.basicSalaryMinor) : 0n,
    allowancesMinor: person.allowancesMinor ? BigInt(person.allowancesMinor) : 0n,
    benefitsMinor: person.benefitsMinor ? BigInt(person.benefitsMinor) : 0n,
    directHourlyRateMinor: person.directHourlyRateMinor ? BigInt(person.directHourlyRateMinor) : 0n,
    paidHoursPerMonth: person.paidHoursPerMonth || 160,
    utilizationRate: person.utilizationRate || 0.7,
    isEthiopianNational: person.isEthiopianNational ?? true,
    pensionRate: person.pensionRate ?? 0.11,
    pensionBase: person.pensionBase ?? 'BASIC',
    pensionCeilingMinor: person.pensionCeilingMinor
      ? BigInt(person.pensionCeilingMinor)
      : undefined,
  });

  return {
    hourlyCostMinor: result.hourlyCost.amount.toString(),
    totalMonthlyCostMinor: result.totalMonthlyCost.amount.toString(),
    monthlyEmployerPensionMinor: result.monthlyEmployerPension.amount.toString(),
    productiveHoursPerMonth: result.productiveHoursPerMonth,
    currency: result.hourlyCost.currency,
  };
}

export function formatCurrencyMinor(amountMinorStr?: string, currency = 'ETB'): string {
  if (!amountMinorStr) return '-';
  const minor = BigInt(amountMinorStr);
  const isNegative = minor < 0n;
  const abs = isNegative ? -minor : minor;
  const major = abs / 100n;
  const santim = (abs % 100n).toString().padStart(2, '0');
  const formattedMajor = Number(major).toLocaleString();
  return `${isNegative ? '-' : ''}${formattedMajor}.${santim} ${currency}`;
}

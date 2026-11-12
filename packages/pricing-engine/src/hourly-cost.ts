import { Money, money, divideRoundHalfUp } from './money';

export type PayType = 'MONTHLY_SALARY' | 'HOURLY' | 'PER_PROJECT' | 'CONTRACTOR';
export type PensionBase = 'BASIC' | 'GROSS';

export interface PersonCostInput {
  payType: PayType;
  currency: string;
  // For monthly salaried employees
  basicSalaryMinor?: bigint | number;
  allowancesMinor?: bigint | number;
  benefitsMinor?: bigint | number;
  // For hourly or contractor rates
  directHourlyRateMinor?: bigint | number;
  // Productivity parameters
  paidHoursPerMonth?: number; // default 160
  utilizationRate?: number; // e.g. 0.70 for 70%
  // Statutory / pension configuration
  isEthiopianNational?: boolean; // foreign nationals exempt
  pensionRate?: number; // default 0.11 (11%)
  pensionBase?: PensionBase; // 'BASIC' (default) or 'GROSS'
  pensionCeilingMinor?: bigint | number; // optional ceiling on pensionable earnings
}

export interface ComputedHourlyCost {
  monthlyBasicCost: Money;
  monthlyAllowances: Money;
  monthlyBenefits: Money;
  monthlyEmployerPension: Money;
  totalMonthlyCost: Money;
  productiveHoursPerMonth: number;
  hourlyCost: Money;
}

/**
 * Calculates the true hourly cost of a person to the agency.
 */
export function hourlyCost(person: PersonCostInput): ComputedHourlyCost {
  const currency = person.currency.toUpperCase();

  // If directly specified as hourly or contractor direct rate:
  if (person.payType === 'HOURLY' || person.payType === 'CONTRACTOR') {
    const rate = BigInt(person.directHourlyRateMinor ?? 0);
    const zero = money(0n, currency);
    const hourly = money(rate, currency);
    return {
      monthlyBasicCost: zero,
      monthlyAllowances: zero,
      monthlyBenefits: zero,
      monthlyEmployerPension: zero,
      totalMonthlyCost: zero,
      productiveHoursPerMonth: person.paidHoursPerMonth ?? 160,
      hourlyCost: hourly,
    };
  }

  // Monthly salaried employees:
  const basic = BigInt(person.basicSalaryMinor ?? 0);
  const allowances = BigInt(person.allowancesMinor ?? 0);
  const benefits = BigInt(person.benefitsMinor ?? 0);

  // Pension calculation:
  let employerPension = 0n;
  if (person.isEthiopianNational !== false) {
    const rate = person.pensionRate ?? 0.11;
    // Base is BASIC by default or GROSS (basic + allowances)
    let pensionableEarnings = person.pensionBase === 'GROSS' ? basic + allowances : basic;

    // Apply optional ceiling
    if (person.pensionCeilingMinor !== undefined && person.pensionCeilingMinor !== null) {
      const ceiling = BigInt(person.pensionCeilingMinor);
      if (pensionableEarnings > ceiling) {
        pensionableEarnings = ceiling;
      }
    }

    // Convert rate to basis points for precise integer rational multiplication (11% = 1100 / 10000)
    const rateBps = BigInt(Math.round(rate * 10000));
    employerPension = divideRoundHalfUp(pensionableEarnings * rateBps, 10000n);
  }

  const totalMonthly = basic + allowances + benefits + employerPension;

  const paidHours = person.paidHoursPerMonth ?? 160;
  const utilization = person.utilizationRate ?? 0.7;
  if (utilization <= 0 || utilization > 1) {
    throw new Error('Utilization rate must be between 0 (exclusive) and 1 (inclusive)');
  }

  const productiveHours = paidHours * utilization;
  if (productiveHours <= 0) {
    throw new Error('Productive hours must be greater than zero');
  }

  // Hourly cost = totalMonthlyCost / productiveHours
  // For precision, multiply by 1000 then divide by productiveHours * 1000
  const productiveHoursScaled = BigInt(Math.round(productiveHours * 1000));
  const hourlyMinor = divideRoundHalfUp(totalMonthly * 1000n, productiveHoursScaled);

  return {
    monthlyBasicCost: money(basic, currency),
    monthlyAllowances: money(allowances, currency),
    monthlyBenefits: money(benefits, currency),
    monthlyEmployerPension: money(employerPension, currency),
    totalMonthlyCost: money(totalMonthly, currency),
    productiveHoursPerMonth: productiveHours,
    hourlyCost: money(hourlyMinor, currency),
  };
}

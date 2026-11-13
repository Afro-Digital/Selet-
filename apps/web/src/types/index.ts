export type UserRole = 'OWNER' | 'PM' | 'DEVELOPER';

export type PayType = 'MONTHLY_SALARY' | 'HOURLY' | 'PER_PROJECT' | 'CONTRACTOR';

export interface Role {
  id: string;
  name: string;
  description?: string;
  defaultHourlyCostMinor?: string;
  currency: string;
}

export interface ComputedHourlyCost {
  hourlyCostMinor: string;
  totalMonthlyCostMinor: string;
  monthlyEmployerPensionMinor: string;
  productiveHoursPerMonth: number;
  currency: string;
}

export interface Person {
  id: string;
  name: string;
  email?: string;
  roleId: string;
  role?: { id: string; name: string };
  payType: PayType;
  currency: string;
  // Sensitive financial fields (optional because backend strips for non-owners)
  basicSalaryMinor?: string;
  allowancesMinor?: string;
  benefitsMinor?: string;
  directHourlyRateMinor?: string;
  paidHoursPerMonth: number;
  utilizationRate: number; // 0.1 to 1.0
  isEthiopianNational: boolean;
  pensionRate: number; // default 0.11
  pensionBase: 'BASIC' | 'GROSS';
  pensionCeilingMinor?: string | null;
  isActive: boolean;
  computedHourlyCost?: ComputedHourlyCost;
}

export interface RateCardItem {
  id: string;
  roleId: string;
  role?: { id: string; name: string };
  hourlyRateMinor: string;
  currency: string;
}

export interface RateCard {
  id: string;
  name: string;
  currency: string;
  effectiveFrom: string;
  isDefault: boolean;
  items: RateCardItem[];
}

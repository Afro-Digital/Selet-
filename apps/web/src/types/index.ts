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

export type CatalogCategory =
  'HOSTING' | 'CDN' | 'DOMAIN' | 'SSL' | 'PAYMENT_GATEWAY' | 'LICENSE' | 'TOOL' | 'OTHER';

export type PriceModel = 'FIXED' | 'PER_MONTH' | 'PER_USER' | 'PERCENTAGE';

export type Payer = 'AGENCY' | 'CLIENT';

export interface CatalogItem {
  id: string;
  name: string;
  category: CatalogCategory;
  priceModel: PriceModel;
  amountMinor: string;
  percentageRate?: number;
  currency: string;
  sourceUrl?: string;
  verifiedAt: string;
  payer: Payer;
  staleAfterDays: number;
  isExample: boolean;
  isStale?: boolean;
  daysSinceVerification?: number;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  isManualOverride: boolean;
  effectiveAt: string;
  isStale?: boolean;
  daysOld?: number;
}

export interface ExchangeRateHistory {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  isManualOverride: boolean;
  capturedAt: string;
}

export type NotificationType =
  'STALE_CATALOG_PRICE' | 'STALE_EXCHANGE_RATE' | 'UNVERIFIED_TAX_RULE' | 'SYSTEM';

export type NotificationSeverity = 'INFO' | 'WARNING' | 'ERROR';

export interface InAppNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

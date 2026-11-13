import { TaxPack, TaxRule } from './schema';

export interface StaleRuleReport {
  rule: TaxRule;
  ageDays: number;
  lastVerified: string;
}

export interface TaxPackAuditSummary {
  packVersion: string;
  country: string;
  effectiveFrom: string;
  totalRulesCount: number;
  unverifiedRulesCount: number;
  staleRulesCount: number;
  unverifiedRules: TaxRule[];
  staleRules: StaleRuleReport[];
  isFullyVerifiedAndFresh: boolean;
  legalDisclaimer: string;
}

const DEFAULT_STALE_MAX_AGE_DAYS = 180; // 6 months

/**
 * Returns all rules explicitly flagged as needing verification due to conflicting or provisional sources.
 */
export function getUnverifiedRules(taxPack: TaxPack): TaxRule[] {
  return taxPack.rules.filter((rule) => rule.needsVerification);
}

/**
 * Calculates day difference between two dates.
 */
function daysDifference(newerDate: Date, olderDate: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((newerDate.getTime() - olderDate.getTime()) / msPerDay);
}

/**
 * Reports rules that have not been verified within the configured threshold (default 180 days).
 */
export function getStaleRules(
  taxPack: TaxPack,
  maxAgeDays: number = DEFAULT_STALE_MAX_AGE_DAYS,
  referenceDate: Date = new Date(),
): StaleRuleReport[] {
  const staleList: StaleRuleReport[] = [];

  for (const rule of taxPack.rules) {
    const verifiedDate = new Date(`${rule.verifiedAt}T00:00:00Z`);
    const ageDays = daysDifference(referenceDate, verifiedDate);

    if (ageDays > maxAgeDays) {
      staleList.push({
        rule,
        ageDays,
        lastVerified: rule.verifiedAt,
      });
    }
  }

  return staleList;
}

/**
 * Produces an audit summary of a tax pack indicating all rules requiring review.
 */
export function auditTaxPack(
  taxPack: TaxPack,
  maxAgeDays: number = DEFAULT_STALE_MAX_AGE_DAYS,
  referenceDate: Date = new Date(),
): TaxPackAuditSummary {
  const unverified = getUnverifiedRules(taxPack);
  const stale = getStaleRules(taxPack, maxAgeDays, referenceDate);

  return {
    packVersion: taxPack.version,
    country: taxPack.country,
    effectiveFrom: taxPack.effectiveFrom,
    totalRulesCount: taxPack.rules.length,
    unverifiedRulesCount: unverified.length,
    staleRulesCount: stale.length,
    unverifiedRules: unverified,
    staleRules: stale,
    isFullyVerifiedAndFresh: unverified.length === 0 && stale.length === 0,
    legalDisclaimer:
      'Selet is not a tax or legal advisor. Statutory rates and thresholds must be independently reviewed and verified by a licensed Ethiopian accountant.',
  };
}

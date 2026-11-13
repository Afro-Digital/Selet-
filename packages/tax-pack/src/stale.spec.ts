import { describe, it, expect } from 'vitest';
import { ethiopia2026TaxPack } from './index';
import { getUnverifiedRules, getStaleRules, auditTaxPack } from './stale';

describe('Stale & Unverified Tax Rules Detection', () => {
  it('identifies unverified rules marked with needsVerification: true', () => {
    const unverified = getUnverifiedRules(ethiopia2026TaxPack);
    expect(unverified.length).toBeGreaterThan(0);

    const ids = unverified.map((r) => r.id);
    // Domestic withholding, PAYE, and severance have conflicting sources
    expect(ids).toContain('et-withholding-services');
    expect(ids).toContain('et-paye-2026');
    expect(ids).toContain('et-severance-provision');
  });

  it('detects rules that have not been verified recently', () => {
    // verifiedAt for ethiopia-2026 is 2026-11-12
    // If we test with referenceDate = 2027-08-01 (more than 180 days later), it should report stale rules
    const futureDate = new Date('2027-08-01T00:00:00Z');
    const stale = getStaleRules(ethiopia2026TaxPack, 180, futureDate);
    expect(stale.length).toBe(ethiopia2026TaxPack.rules.length);
    expect(stale[0]!.ageDays).toBeGreaterThan(180);
  });

  it('reports fresh when verified within maxAgeDays', () => {
    // Exactly on or shortly after verification date 2026-11-12
    const currentDate = new Date('2026-11-15T00:00:00Z');
    const stale = getStaleRules(ethiopia2026TaxPack, 180, currentDate);
    expect(stale.length).toBe(0);
  });

  it('generates an audit summary containing disclaimer and metrics', () => {
    const summary = auditTaxPack(ethiopia2026TaxPack, 180, new Date('2026-11-15T00:00:00Z'));
    expect(summary.totalRulesCount).toBe(ethiopia2026TaxPack.rules.length);
    expect(summary.unverifiedRulesCount).toBeGreaterThan(0);
    expect(summary.legalDisclaimer).toContain('Selet is not a tax or legal advisor');
  });
});

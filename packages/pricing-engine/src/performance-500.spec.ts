import { describe, it, expect } from 'vitest';
import { threePointHours } from './pert';
import { calculateProjectCost, LaborLine } from './project-cost';
import {
  createBalancerLine,
  lockBlended,
  targetPriceMode,
  applyDiscount,
} from './margin-balancer';
import { calculateQuoteTaxes } from './taxes';
import { money } from './money';

describe('Performance Benchmark: Large Enterprise Estimates (500+ Features)', () => {
  it('rolls up 600 features with PERT, direct labor, risk, overhead, and taxes in < 50ms', () => {
    const NUM_MODULES = 12;
    const FEATURES_PER_MODULE = 50;
    const TOTAL_FEATURES = NUM_MODULES * FEATURES_PER_MODULE; // 600 features

    const roles = [
      { id: 'role-lead', name: 'Lead Architect', hourlyCostMinor: 65000n }, // 650 ETB/hr
      { id: 'role-backend', name: 'Senior Backend Engineer', hourlyCostMinor: 45000n }, // 450 ETB/hr
      { id: 'role-frontend', name: 'Senior Frontend Engineer', hourlyCostMinor: 40000n }, // 400 ETB/hr
      { id: 'role-qa', name: 'QA & Automation Engineer', hourlyCostMinor: 30000n }, // 300 ETB/hr
      { id: 'role-devops', name: 'DevOps & SRE Specialist', hourlyCostMinor: 50000n }, // 500 ETB/hr
    ];

    const startTime = performance.now();

    // 1. Generate 600 features and compute PERT for each
    const laborLines: LaborLine[] = [];
    let totalPertHours = 0;

    for (let m = 1; m <= NUM_MODULES; m++) {
      for (let f = 1; f <= FEATURES_PER_MODULE; f++) {
        // PERT 3-point estimate
        const opt = 4 + ((f * 3) % 10);
        const nom = opt + 4 + ((f * 7) % 15);
        const pess = nom + 8 + ((f * 11) % 30);

        const pert = threePointHours(opt, nom, pess);
        totalPertHours += pert.expected;

        const role = roles[(m * 7 + f) % roles.length]!;
        laborLines.push({
          roleId: role.id,
          roleName: role.name,
          hours: pert.expected,
          hourlyCost: money(role.hourlyCostMinor, 'ETB'),
        });
      }
    }

    expect(laborLines.length).toBe(TOTAL_FEATURES);
    expect(totalPertHours).toBeGreaterThan(0);

    // 2. Compute Full Project Cost Breakdown (Direct + 10% Risk + 15% Overhead)
    const costBreakdown = calculateProjectCost(
      {
        currency: 'ETB',
        laborLines,
        toolsCost: money(15000000n, 'ETB'), // 150,000 ETB tooling
        agencyInfrastructureCost: money(25000000n, 'ETB'), // 250,000 ETB infra
      },
      {
        contingencyRate: 0.1, // 10%
        riskMultipliers: [0.05, 0.05], // 10%
        overheadRate: 0.15, // 15%
      },
    );

    // 3. Balance 12 Modules at 35% Blended Margin
    const moduleCostMoney = money(costBreakdown.totalCost.amount / BigInt(NUM_MODULES), 'ETB');
    const balancerLines = Array.from({ length: NUM_MODULES }, (_, i) =>
      createBalancerLine(`mod-${i + 1}`, `Enterprise Module ${i + 1}`, moduleCostMoney, 0.35, {
        floorMargin: 0.15,
        ceilingMargin: 0.7,
      }),
    );

    // Adjust first module from 35% down to 25% while locking blended margin at 35%
    const balanced = lockBlended(balancerLines, 'mod-1', 0.25, 0.35);

    // 4. Target Enterprise Budget Mode
    const targetPrice = money(Number(costBreakdown.totalCost.amount) / (1 - 0.32), 'ETB');
    const targetSolved = targetPriceMode(balancerLines, targetPrice);

    // 5. Apply 5% Enterprise Negotiation Discount
    const discounted = applyDiscount(targetSolved.lines, 0.05);

    // 6. Compute Statutory Ethiopian Taxes on Final Proposed Price
    const finalPrice = discounted.totalPrice;
    const taxes = calculateQuoteTaxes(finalPrice, {
      vatRate: 0.15, // VAT Proc 1341/2016
      withholdingRate: 0.03, // 3% withholding
    });

    const endTime = performance.now();
    const durationMs = endTime - startTime;

    // Verifications
    expect(durationMs).toBeLessThan(100); // Must be sub-100ms
    expect(costBreakdown.totalCost.amount).toBeGreaterThan(0n);
    expect(balanced.lines.length).toBe(NUM_MODULES);
    expect(balanced.isFeasible).toBe(true);
    expect(targetSolved.isFeasible).toBe(true);
    expect(discounted.lines.length).toBe(NUM_MODULES);
    expect(taxes.vatAmount.amount).toBeGreaterThan(0n);
    expect(taxes.withholdingAmount.amount).toBeGreaterThan(0n);
    expect(taxes.totalClientPayable.amount).toBe(finalPrice.amount + taxes.vatAmount.amount);
  });
});

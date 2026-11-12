import { describe, it, expect } from 'vitest';
import { money } from './money';
import { calculateProjectCost } from './project-cost';

describe('Project Cost rollup', () => {
  it('rolls up labor, tools, infrastructure, risk, and overhead', () => {
    // Labor: 100 hours at 350.00 ETB (35,000 santim) = 35,000.00 ETB (3,500,000 santim)
    // Tools: 2,000.00 ETB (200,000 santim)
    // Infra: 3,000.00 ETB (300,000 santim)
    // Direct cost = 40,000.00 ETB (4,000,000 santim)
    // Risk: contingency 10% + multiplier 5% = 15% -> 6,000.00 ETB (600,000 santim)
    // Subtotal with risk = 46,000.00 ETB (4,600,000 santim)
    // Overhead: 10% of subtotal = 4,600.00 ETB (460,000 santim)
    // Total cost = 50,600.00 ETB (5,060,000 santim)
    const breakdown = calculateProjectCost(
      {
        currency: 'ETB',
        laborLines: [
          {
            roleName: 'Senior Dev',
            hours: 100,
            hourlyCost: money(35000n, 'ETB'),
          },
        ],
        toolsCost: money(200000n, 'ETB'),
        agencyInfrastructureCost: money(300000n, 'ETB'),
      },
      {
        contingencyRate: 0.1,
        riskMultipliers: [0.05],
        overheadRate: 0.1,
      },
    );

    expect(breakdown.laborCost.amount).toBe(3500000n);
    expect(breakdown.directCost.amount).toBe(4000000n);
    expect(breakdown.riskCost.amount).toBe(600000n);
    expect(breakdown.subtotalWithRisk.amount).toBe(4600000n);
    expect(breakdown.overheadCost.amount).toBe(460000n);
    expect(breakdown.totalCost.amount).toBe(5060000n);
  });
});

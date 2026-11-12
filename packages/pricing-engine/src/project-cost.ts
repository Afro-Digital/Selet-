import { Money, money, add, multiplyRational, sum } from './money';

export interface LaborLine {
  roleId?: string;
  roleName?: string;
  hours: number;
  hourlyCost: Money;
}

export interface DirectCostInputs {
  currency: string;
  laborLines?: LaborLine[];
  directLaborCost?: Money; // optional precomputed direct labor
  toolsCost?: Money;
  agencyInfrastructureCost?: Money;
  thirdPartyCost?: Money;
}

export interface RiskAndOverheadInputs {
  contingencyRate?: number; // e.g. 0.10 for 10%
  riskMultipliers?: number[]; // e.g. [0.05, 0.05] for tight deadline / new tech
  overheadRate?: number; // e.g. 0.15 for 15%
}

export interface ProjectCostBreakdown {
  currency: string;
  laborCost: Money;
  toolsCost: Money;
  agencyInfrastructureCost: Money;
  thirdPartyCost: Money;
  directCost: Money;
  riskCost: Money;
  subtotalWithRisk: Money;
  overheadCost: Money;
  totalCost: Money;
}

/**
 * Calculates project costs combining labor, tools, infrastructure, risk, and overhead.
 */
export function calculateProjectCost(
  directInputs: DirectCostInputs,
  factors: RiskAndOverheadInputs = {},
): ProjectCostBreakdown {
  const currency = directInputs.currency.toUpperCase();

  // 1. Labor
  let laborCost: Money;
  if (directInputs.directLaborCost) {
    laborCost = directInputs.directLaborCost;
  } else if (directInputs.laborLines && directInputs.laborLines.length > 0) {
    const lines = directInputs.laborLines.map((line) => {
      const hoursScaled = BigInt(Math.round(line.hours * 1000));
      return multiplyRational(line.hourlyCost, hoursScaled, 1000n);
    });
    laborCost = sum(lines, currency);
  } else {
    laborCost = money(0n, currency);
  }

  const tools = directInputs.toolsCost ?? money(0n, currency);
  const infra = directInputs.agencyInfrastructureCost ?? money(0n, currency);
  const thirdParty = directInputs.thirdPartyCost ?? money(0n, currency);

  // 2. Direct cost = labor + tools + infrastructure + third-party
  const directCost = sum([laborCost, tools, infra, thirdParty], currency);

  // 3. Risk = direct cost * (contingency + sum(multipliers))
  const contingency = factors.contingencyRate ?? 0;
  const multipliersSum = (factors.riskMultipliers ?? []).reduce((acc, m) => acc + m, 0);
  const totalRiskRate = contingency + multipliersSum;

  const riskBps = BigInt(Math.round(totalRiskRate * 10000));
  const riskCost = multiplyRational(directCost, riskBps, 10000n);

  const subtotalWithRisk = add(directCost, riskCost);

  // 4. Overhead = (direct cost + risk) * overhead rate
  const overheadRate = factors.overheadRate ?? 0;
  const overheadBps = BigInt(Math.round(overheadRate * 10000));
  const overheadCost = multiplyRational(subtotalWithRisk, overheadBps, 10000n);

  // 5. Total cost = direct cost + risk + overhead
  const totalCost = add(subtotalWithRisk, overheadCost);

  return {
    currency,
    laborCost,
    toolsCost: tools,
    agencyInfrastructureCost: infra,
    thirdPartyCost: thirdParty,
    directCost,
    riskCost,
    subtotalWithRisk,
    overheadCost,
    totalCost,
  };
}

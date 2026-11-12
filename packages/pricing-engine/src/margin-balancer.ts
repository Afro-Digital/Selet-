import { Money, money, subtract, sum, allocate, divideRoundHalfUp } from './money';
import { priceFromMargin, marginFromPrice, validateMargin } from './margin';

export interface BalancerLine {
  id: string;
  name: string;
  cost: Money;
  margin: number;
  price: Money;
  floorMargin?: number; // minimum allowed margin (e.g. 0.15)
  ceilingMargin?: number; // maximum allowed margin (e.g. 0.70)
}

export interface BalancerResult {
  lines: BalancerLine[];
  totalCost: Money;
  totalPrice: Money;
  blendedMargin: number;
  isFeasible: boolean;
  gapPrice?: Money;
  infeasibilityReason?: string;
  violations?: {
    lineId: string;
    lineName: string;
    attemptedMargin: number;
    boundType: 'FLOOR' | 'CEILING';
    boundValue: number;
  }[];
}

/**
 * Creates a valid BalancerLine with calculated price.
 */
export function createBalancerLine(
  id: string,
  name: string,
  cost: Money,
  margin: number,
  options: { floorMargin?: number; ceilingMargin?: number } = {},
): BalancerLine {
  validateMargin(margin);
  const price = priceFromMargin(cost, margin);
  return {
    id,
    name,
    cost,
    margin,
    price,
    floorMargin: options.floorMargin,
    ceilingMargin: options.ceilingMargin ?? 0.95,
  };
}

/**
 * Computes overall totals and blended margin from an array of balancer lines.
 */
export function summarizeLines(lines: BalancerLine[]): {
  totalCost: Money;
  totalPrice: Money;
  blendedMargin: number;
} {
  if (lines.length === 0) {
    throw new Error('Lines array cannot be empty');
  }
  const currency = lines[0]!.cost.currency;
  const totalCost = sum(
    lines.map((l) => l.cost),
    currency,
  );
  const totalPrice = sum(
    lines.map((l) => l.price),
    currency,
  );

  if (totalPrice.amount === 0n) {
    return { totalCost, totalPrice, blendedMargin: 0 };
  }

  const blended = marginFromPrice(totalCost, totalPrice);
  return { totalCost, totalPrice, blendedMargin: blended };
}

/**
 * Lock blended margin mode:
 * Changes one line's margin to `newMargin`, keeps target blended margin `targetBlended`,
 * and adjusts the specified balancing lines to absorb the difference.
 */
export function lockBlended(
  lines: BalancerLine[],
  changedLineId: string,
  newMargin: number,
  targetBlended: number,
  balancingLineIds?: string[],
): BalancerResult {
  validateMargin(newMargin);
  validateMargin(targetBlended);

  const currency = lines[0]!.cost.currency;
  const changedIdx = lines.findIndex((l) => l.id === changedLineId);
  if (changedIdx === -1) {
    throw new Error(`Changed line with id '${changedLineId}' not found`);
  }

  // Determine balancing lines: default to all other lines if not specified
  const eligibleBalancingIds = new Set(
    balancingLineIds ?? lines.filter((l) => l.id !== changedLineId).map((l) => l.id),
  );

  // Clone lines
  const updatedLines: BalancerLine[] = lines.map((l) => ({ ...l }));

  // 1. Update changed line
  const changedLine = updatedLines[changedIdx]!;
  const newChangedPrice = priceFromMargin(changedLine.cost, newMargin);
  updatedLines[changedIdx] = {
    ...changedLine,
    margin: newMargin,
    price: newChangedPrice,
  };

  // 2. Compute total cost and required total price for targetBlended
  const totalCost = sum(
    updatedLines.map((l) => l.cost),
    currency,
  );
  // P_target = totalCost / (1 - targetBlended)
  const targetBps = BigInt(Math.round(targetBlended * 10000));
  const targetDen = 10000n - targetBps;
  if (targetDen <= 0n) {
    throw new Error('Target blended margin cannot be 100% or greater');
  }
  const requiredTotalPrice = money(
    divideRoundHalfUp(totalCost.amount * 10000n, targetDen),
    currency,
  );

  // 3. Price needed from all balancing lines
  const unaffectedLines = updatedLines.filter(
    (l) => l.id !== changedLineId && !eligibleBalancingIds.has(l.id),
  );
  const unaffectedPrice = sum([newChangedPrice, ...unaffectedLines.map((l) => l.price)], currency);

  const neededBalancingPrice = subtract(requiredTotalPrice, unaffectedPrice);

  // 4. Balancing lines
  const balancingIndices = updatedLines
    .map((l, idx) => (eligibleBalancingIds.has(l.id) && l.id !== changedLineId ? idx : -1))
    .filter((idx) => idx !== -1);

  if (balancingIndices.length === 0) {
    return {
      lines: updatedLines,
      totalCost,
      totalPrice: sum(
        updatedLines.map((l) => l.price),
        currency,
      ),
      blendedMargin: marginFromPrice(
        totalCost,
        sum(
          updatedLines.map((l) => l.price),
          currency,
        ),
      ),
      isFeasible: false,
      infeasibilityReason: 'No balancing lines available to absorb margin adjustment',
    };
  }

  // Allocate needed price across balancing lines based on their cost weights
  const balancingCosts = balancingIndices.map((idx) => updatedLines[idx]!.cost.amount);
  const allocatedPrices = allocate(neededBalancingPrice, balancingCosts);

  const violations: BalancerResult['violations'] = [];
  let isFeasible = true;

  for (let i = 0; i < balancingIndices.length; i++) {
    const idx = balancingIndices[i]!;
    const line = updatedLines[idx]!;
    const allocPrice = allocatedPrices[i]!;

    if (allocPrice.amount <= line.cost.amount) {
      // Negative margin or zero price
      const attemptedMargin = marginFromPrice(
        line.cost,
        allocPrice.amount > 0n ? allocPrice : money(1n, currency),
      );
      isFeasible = false;
      violations.push({
        lineId: line.id,
        lineName: line.name,
        attemptedMargin,
        boundType: 'FLOOR',
        boundValue: line.floorMargin ?? 0,
      });
    }

    const calcMargin = marginFromPrice(line.cost, allocPrice);

    // Check floor
    if (line.floorMargin !== undefined && calcMargin < line.floorMargin) {
      isFeasible = false;
      violations.push({
        lineId: line.id,
        lineName: line.name,
        attemptedMargin: calcMargin,
        boundType: 'FLOOR',
        boundValue: line.floorMargin,
      });
    }

    // Check ceiling
    const ceiling = line.ceilingMargin ?? 0.95;
    if (calcMargin > ceiling) {
      isFeasible = false;
      violations.push({
        lineId: line.id,
        lineName: line.name,
        attemptedMargin: calcMargin,
        boundType: 'CEILING',
        boundValue: ceiling,
      });
    }

    updatedLines[idx] = {
      ...line,
      price: allocPrice,
      margin: calcMargin,
    };
  }

  const actualTotalPrice = sum(
    updatedLines.map((l) => l.price),
    currency,
  );
  const actualBlended = marginFromPrice(totalCost, actualTotalPrice);
  const gap = subtract(requiredTotalPrice, actualTotalPrice);

  return {
    lines: updatedLines,
    totalCost,
    totalPrice: actualTotalPrice,
    blendedMargin: actualBlended,
    isFeasible,
    gapPrice: gap.amount !== 0n ? gap : undefined,
    infeasibilityReason: isFeasible
      ? undefined
      : `Balancing lines exceeded margin guardrails (floors/ceilings). Gap: ${gap.amount}`,
    violations: violations.length > 0 ? violations : undefined,
  };
}

/**
 * Target price mode:
 * Client gives a fixed budget B. Recomputes blended margin and distributes budget.
 */
export function targetPriceMode(
  lines: BalancerLine[],
  budget: Money,
  floorBlendedMargin?: number,
): BalancerResult {
  const currency = budget.currency;
  const totalCost = sum(
    lines.map((l) => l.cost),
    currency,
  );

  if (budget.amount <= totalCost.amount) {
    const rawMargin = Number(budget.amount - totalCost.amount) / Number(budget.amount);
    return {
      lines: [...lines],
      totalCost,
      totalPrice: budget,
      blendedMargin: rawMargin,
      isFeasible: false,
      infeasibilityReason: `Budget ${budget.amount} does not cover total cost ${totalCost.amount}`,
    };
  }

  const blended = marginFromPrice(totalCost, budget);
  const isFloorViolated = floorBlendedMargin !== undefined && blended < floorBlendedMargin;

  // Allocate budget across lines proportionally to their cost
  const costs = lines.map((l) => l.cost.amount);
  const allocatedPrices = allocate(budget, costs);

  const updatedLines: BalancerLine[] = lines.map((line, idx) => {
    const p = allocatedPrices[idx]!;
    const m = marginFromPrice(line.cost, p);
    return {
      ...line,
      price: p,
      margin: m,
    };
  });

  return {
    lines: updatedLines,
    totalCost,
    totalPrice: budget,
    blendedMargin: blended,
    isFeasible: !isFloorViolated,
    infeasibilityReason: isFloorViolated
      ? `Resulting blended margin (${(blended * 100).toFixed(1)}%) is below owner floor (${((floorBlendedMargin ?? 0) * 100).toFixed(1)}%)`
      : undefined,
  };
}

/**
 * What-if discount mode:
 * Applies a percentage discount to the total price or a specific line.
 */
export function applyDiscount(
  lines: BalancerLine[],
  discountPercent: number, // e.g. 0.10 for 10%
  targetLineId?: string,
  projectFloorMargin?: number,
): BalancerResult {
  if (discountPercent < 0 || discountPercent >= 1.0) {
    throw new Error('Discount percentage must be between 0% and <100%');
  }

  const currency = lines[0]!.cost.currency;
  const updatedLines = lines.map((l) => ({ ...l }));
  const discountBps = BigInt(Math.round(discountPercent * 10000));
  const multBps = 10000n - discountBps;

  if (targetLineId) {
    const idx = updatedLines.findIndex((l) => l.id === targetLineId);
    if (idx === -1) throw new Error(`Line ${targetLineId} not found`);
    const line = updatedLines[idx]!;
    const newPriceMinor = divideRoundHalfUp(line.price.amount * multBps, 10000n);
    const newPrice = money(newPriceMinor, currency);
    const newMargin = marginFromPrice(line.cost, newPrice);
    updatedLines[idx] = { ...line, price: newPrice, margin: newMargin };
  } else {
    for (let i = 0; i < updatedLines.length; i++) {
      const line = updatedLines[i]!;
      const newPriceMinor = divideRoundHalfUp(line.price.amount * multBps, 10000n);
      const newPrice = money(newPriceMinor, currency);
      const newMargin = marginFromPrice(line.cost, newPrice);
      updatedLines[i] = { ...line, price: newPrice, margin: newMargin };
    }
  }

  const totalCost = sum(
    updatedLines.map((l) => l.cost),
    currency,
  );
  const totalPrice = sum(
    updatedLines.map((l) => l.price),
    currency,
  );
  const blended = marginFromPrice(totalCost, totalPrice);

  const isFloorViolated = projectFloorMargin !== undefined && blended < projectFloorMargin;

  return {
    lines: updatedLines,
    totalCost,
    totalPrice,
    blendedMargin: blended,
    isFeasible: !isFloorViolated,
    infeasibilityReason: isFloorViolated
      ? `Discounted blended margin (${(blended * 100).toFixed(1)}%) breaks the project floor (${((projectFloorMargin ?? 0) * 100).toFixed(1)}%)`
      : undefined,
  };
}

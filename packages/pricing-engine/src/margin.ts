import { Money, money, divideRoundHalfUp, subtract } from './money';

export const PRICING_ENGINE_VERSION = '0.1.0';

export function getEngineInfo(): string {
  return `Selet Pricing Engine v${PRICING_ENGINE_VERSION}`;
}

export class InvalidMarginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMarginError';
  }
}

/**
 * Validates that margin is in [0, 1) decimal range (e.g. 0.30 for 30%).
 */
export function validateMargin(margin: number): void {
  if (
    margin === undefined ||
    margin === null ||
    Number.isNaN(margin) ||
    margin < 0 ||
    margin >= 1.0
  ) {
    throw new InvalidMarginError(
      `Margin must be in the range [0, 1.0) (0% to <100%), but got ${margin}`,
    );
  }
}

/**
 * Calculates price from cost and margin: price = cost / (1 - margin)
 */
export function priceFromMargin(
  cost: Money | number | bigint,
  margin: number,
  currency = 'ETB',
): Money {
  validateMargin(margin);

  const costMoney = typeof cost === 'object' && 'amount' in cost ? cost : money(cost, currency);

  // price = cost / (1 - margin)
  // To avoid floating point issues, scale (1 - margin) to basis points:
  // (1 - margin) * 10,000
  const marginBps = BigInt(Math.round(margin * 10000));
  const denominator = 10000n - marginBps;
  if (denominator <= 0n) {
    throw new InvalidMarginError('Margin cannot be 100% or greater');
  }

  const priceMinor = divideRoundHalfUp(costMoney.amount * 10000n, denominator);
  return money(priceMinor, costMoney.currency);
}

/**
 * Calculates margin on price: margin = (price - cost) / price = 1 - cost / price
 * Returns decimal margin (e.g. 0.3 for 30%).
 */
export function marginFromPrice(cost: Money, price: Money): number {
  if (cost.currency !== price.currency) {
    throw new Error('Currency mismatch between cost and price');
  }
  if (price.amount <= 0n) {
    throw new Error('Price must be greater than zero to calculate margin');
  }

  // Margin = (price - cost) / price
  const diff = Number(price.amount - cost.amount);
  const p = Number(price.amount);
  return diff / p;
}

/**
 * Calculates profit from price and cost.
 */
export function profitFromPrice(cost: Money, price: Money): Money {
  return subtract(price, cost);
}

/**
 * Blended margin across multiple line items:
 * M = 1 - sum(C_i) / sum(P_i)
 */
export function calculateBlendedMargin(totalCost: Money, totalPrice: Money): number {
  return marginFromPrice(totalCost, totalPrice);
}

export interface PriceRangeResult {
  low: {
    hoursType: 'OPTIMISTIC';
    cost: Money;
    margin: number;
    price: Money;
    profit: Money;
  };
  recommended: {
    hoursType: 'LIKELY';
    cost: Money;
    margin: number;
    price: Money;
    profit: Money;
  };
  high: {
    hoursType: 'PESSIMISTIC';
    cost: Money;
    margin: number;
    price: Money;
    profit: Money;
  };
  marketComparison?: {
    marketMin: Money;
    marketMax: Money;
    isBelowMarket: boolean;
    isAboveMarket: boolean;
    isWithinMarket: boolean;
  };
}

export interface PriceRangeInputs {
  optimisticCost: Money;
  likelyCost: Money;
  pessimisticCost: Money;
  minimumMargin: number; // e.g. 0.20
  targetMargin: number; // e.g. 0.30
  stretchMargin: number; // e.g. 0.40
  marketMin?: Money;
  marketMax?: Money;
}

/**
 * Computes the 3-tier price range (Low, Recommended, High) and market comparison.
 */
export function calculatePriceRange(inputs: PriceRangeInputs): PriceRangeResult {
  const lowPrice = priceFromMargin(inputs.optimisticCost, inputs.minimumMargin);
  const recommendedPrice = priceFromMargin(inputs.likelyCost, inputs.targetMargin);
  const highPrice = priceFromMargin(inputs.pessimisticCost, inputs.stretchMargin);

  let marketComparison: PriceRangeResult['marketComparison'];

  if (inputs.marketMin && inputs.marketMax) {
    const recAmount = recommendedPrice.amount;
    const isBelow = recAmount < inputs.marketMin.amount;
    const isAbove = recAmount > inputs.marketMax.amount;
    marketComparison = {
      marketMin: inputs.marketMin,
      marketMax: inputs.marketMax,
      isBelowMarket: isBelow,
      isAboveMarket: isAbove,
      isWithinMarket: !isBelow && !isAbove,
    };
  }

  return {
    low: {
      hoursType: 'OPTIMISTIC',
      cost: inputs.optimisticCost,
      margin: inputs.minimumMargin,
      price: lowPrice,
      profit: profitFromPrice(inputs.optimisticCost, lowPrice),
    },
    recommended: {
      hoursType: 'LIKELY',
      cost: inputs.likelyCost,
      margin: inputs.targetMargin,
      price: recommendedPrice,
      profit: profitFromPrice(inputs.likelyCost, recommendedPrice),
    },
    high: {
      hoursType: 'PESSIMISTIC',
      cost: inputs.pessimisticCost,
      margin: inputs.stretchMargin,
      price: highPrice,
      profit: profitFromPrice(inputs.pessimisticCost, highPrice),
    },
    marketComparison,
  };
}

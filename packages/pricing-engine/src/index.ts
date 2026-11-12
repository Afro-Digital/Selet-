import { APP_NAME } from '@selet/shared';

export const PRICING_ENGINE_VERSION = '0.1.0';

/**
 * Basic money representation in minor units (e.g. santim / cents).
 */
export interface Money {
  amount: bigint | number;
  currency: string;
}

/**
 * Calculates price from cost and margin: price = cost / (1 - margin)
 * Margin is represented as a decimal, e.g., 0.3 for 30%.
 */
export function priceFromMargin(costMinor: number, margin: number): number {
  if (margin < 0 || margin >= 1) {
    throw new Error('Margin must be in the range [0, 1)');
  }
  return Math.round(costMinor / (1 - margin));
}

export function getEngineInfo(): string {
  return `${APP_NAME} Pricing Engine v${PRICING_ENGINE_VERSION}`;
}

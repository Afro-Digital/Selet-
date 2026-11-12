export class CurrencyMismatchError extends Error {
  constructor(c1: string, c2: string) {
    super(`Currency mismatch: cannot operate on ${c1} and ${c2}`);
    this.name = 'CurrencyMismatchError';
  }
}

export interface Money {
  amount: bigint; // Integer minor units (e.g. santim, cents)
  currency: string; // ISO 4217 code (e.g. 'ETB', 'USD', 'EUR')
}

/**
 * Creates a Money object in integer minor units.
 */
export function money(amount: bigint | number, currency: string): Money {
  if (typeof amount === 'number') {
    if (!Number.isFinite(amount)) {
      throw new Error(`Invalid money amount: ${amount}`);
    }
    // Round to nearest integer minor unit
    amount = BigInt(Math.round(amount));
  }
  return { amount, currency: currency.toUpperCase() };
}

/**
 * Converts a major unit amount (e.g. 100.50 ETB) to minor units (10050 santim).
 */
export function fromMajorUnits(major: number, currency: string, decimals = 2): Money {
  if (!Number.isFinite(major)) {
    throw new Error(`Invalid major unit amount: ${major}`);
  }
  const factor = 10 ** decimals;
  const minor = BigInt(Math.round(major * factor));
  return money(minor, currency);
}

/**
 * Converts minor units to major units for display.
 */
export function toMajorUnits(m: Money, decimals = 2): number {
  const factor = 10 ** decimals;
  return Number(m.amount) / factor;
}

/**
 * Checks that two Money values have identical currency.
 */
function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new CurrencyMismatchError(a.currency, b.currency);
  }
}

/**
 * Round half up division of bigints: roundHalfUp(num / den).
 */
export function divideRoundHalfUp(numerator: bigint, denominator: bigint): bigint {
  if (denominator === 0n) {
    throw new Error('Division by zero');
  }
  if (numerator === 0n) return 0n;

  const isNegative = numerator < 0n !== denominator < 0n;
  const absNum = numerator < 0n ? -numerator : numerator;
  const absDen = denominator < 0n ? -denominator : denominator;

  // Remainder and quotient
  const quotient = absNum / absDen;
  const remainder = absNum % absDen;

  // Half of denominator rounded up
  const half = (absDen + 1n) / 2n;
  const rounded = remainder >= half ? quotient + 1n : quotient;

  return isNegative ? -rounded : rounded;
}

/**
 * Adds two Money instances.
 */
export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount + b.amount, currency: a.currency };
}

/**
 * Sums an array of Money instances.
 */
export function sum(items: Money[], currency?: string): Money {
  if (items.length === 0) {
    if (!currency) {
      throw new Error('Cannot sum an empty array of Money without specifying a currency');
    }
    return money(0n, currency);
  }
  const curr = currency ?? items[0]!.currency;
  return items.reduce((acc, currItem) => add(acc, currItem), money(0n, curr));
}

/**
 * Subtracts Money b from Money a.
 */
export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount - b.amount, currency: a.currency };
}

/**
 * Multiplies Money by a rational number (numerator / denominator) with round half up.
 */
export function multiplyRational(
  m: Money,
  numerator: bigint | number,
  denominator: bigint | number = 1n,
): Money {
  const num = BigInt(numerator);
  const den = BigInt(denominator);
  const newAmount = divideRoundHalfUp(m.amount * num, den);
  return { amount: newAmount, currency: m.currency };
}

/**
 * Allocates an amount across multiple ratios without losing a single minor unit.
 * Uses the Largest Remainder Method (Hamilton/Hare-Niemeyer).
 */
export function allocate(m: Money, ratios: (bigint | number)[]): Money[] {
  if (ratios.length === 0) return [];

  const bigRatios = ratios.map((r) => {
    const b = BigInt(r);
    if (b < 0n) throw new Error('Ratios must be non-negative');
    return b;
  });

  const totalRatio = bigRatios.reduce((acc, r) => acc + r, 0n);
  if (totalRatio === 0n) {
    throw new Error('Sum of ratios cannot be zero');
  }

  const shares: bigint[] = [];
  const remainders: { index: number; remainder: bigint }[] = [];
  let allocatedTotal = 0n;

  for (let i = 0; i < bigRatios.length; i++) {
    const ratio = bigRatios[i]!;
    const product = m.amount * ratio;
    const share = product / totalRatio;
    const rem = product % totalRatio;

    shares.push(share);
    remainders.push({ index: i, remainder: rem });
    allocatedTotal += share;
  }

  // Distribute leftover minor units to largest remainders
  let leftover = m.amount - allocatedTotal;
  remainders.sort((a, b) => (b.remainder > a.remainder ? 1 : b.remainder < a.remainder ? -1 : 0));

  for (let i = 0; i < Number(leftover); i++) {
    const targetIdx = remainders[i % remainders.length]!.index;
    shares[targetIdx] = shares[targetIdx]! + 1n;
  }

  return shares.map((amount) => ({ amount, currency: m.currency }));
}

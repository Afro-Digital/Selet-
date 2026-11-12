import { describe, it, expect } from 'vitest';
import {
  money,
  fromMajorUnits,
  toMajorUnits,
  add,
  subtract,
  multiplyRational,
  allocate,
  divideRoundHalfUp,
  CurrencyMismatchError,
} from './money';

describe('Money module', () => {
  it('creates money in integer minor units', () => {
    const m = money(150000n, 'ETB');
    expect(m.amount).toBe(150000n);
    expect(m.currency).toBe('ETB');
  });

  it('converts major units to minor units and back', () => {
    const m = fromMajorUnits(1500.5, 'ETB');
    expect(m.amount).toBe(150050n);
    expect(toMajorUnits(m)).toBe(1500.5);
  });

  it('adds and subtracts money with same currency', () => {
    const a = money(1000n, 'ETB');
    const b = money(500n, 'ETB');
    expect(add(a, b).amount).toBe(1500n);
    expect(subtract(a, b).amount).toBe(500n);
  });

  it('throws on currency mismatch', () => {
    const etb = money(1000n, 'ETB');
    const usd = money(1000n, 'USD');
    expect(() => add(etb, usd)).toThrow(CurrencyMismatchError);
    expect(() => subtract(etb, usd)).toThrow(CurrencyMismatchError);
  });

  it('performs round half up integer division correctly', () => {
    // 5 / 2 = 2.5 -> 3
    expect(divideRoundHalfUp(5n, 2n)).toBe(3n);
    // 4 / 2 = 2.0 -> 2
    expect(divideRoundHalfUp(4n, 2n)).toBe(2n);
    // 1 / 3 = 0.333... -> 0
    expect(divideRoundHalfUp(1n, 3n)).toBe(0n);
    // 2 / 3 = 0.666... -> 1
    expect(divideRoundHalfUp(2n, 3n)).toBe(1n);
  });

  it('multiplies by rational with round half up', () => {
    const m = money(100n, 'ETB');
    // 100 * 1 / 3 = 33.33 -> 33
    expect(multiplyRational(m, 1n, 3n).amount).toBe(33n);
    // 100 * 2 / 3 = 66.67 -> 67
    expect(multiplyRational(m, 2n, 3n).amount).toBe(67n);
  });

  it('allocates amounts without losing a single minor unit (Hare-Niemeyer / Hamilton method)', () => {
    const total = money(100n, 'ETB');
    // Split 100 into 3 equal shares (1:1:1)
    const shares = allocate(total, [1, 1, 1]);
    expect(shares.length).toBe(3);
    const sumAmounts = shares.reduce((acc, s) => acc + s.amount, 0n);
    expect(sumAmounts).toBe(100n);
    // Shares should be 34, 33, 33 (or similar distribution totaling 100)
    expect(shares[0]!.amount + shares[1]!.amount + shares[2]!.amount).toBe(100n);
  });
});

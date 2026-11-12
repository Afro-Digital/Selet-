/**
 * PERT (Program Evaluation and Review Technique) three-point estimation.
 */
export interface ThreePointEstimate {
  optimistic: number; // O
  likely: number; // L
  pessimistic: number; // P
}

export interface PertResult {
  optimistic: number;
  likely: number; // raw input L
  pessimistic: number;
  expected: number; // (O + 4L + P) / 6
}

/**
 * Calculates PERT expected hours from optimistic, likely, and pessimistic estimates.
 * Expected = (O + 4L + P) / 6
 */
export function threePointHours(o: number, l: number, p: number): PertResult {
  if (o < 0 || l < 0 || p < 0) {
    throw new Error('Hour estimates cannot be negative');
  }
  if (o > l || l > p) {
    throw new Error(
      `Invalid three-point estimate: expected O <= L <= P, but got O=${o}, L=${l}, P=${p}`,
    );
  }

  const expected = (o + 4 * l + p) / 6;
  return {
    optimistic: o,
    likely: l,
    pessimistic: p,
    expected,
  };
}

/**
 * Aggregates multiple 3-point estimates into combined totals.
 */
export function aggregateThreePointEstimates(estimates: ThreePointEstimate[]): PertResult {
  let totalO = 0;
  let totalL = 0;
  let totalP = 0;

  for (const est of estimates) {
    totalO += est.optimistic;
    totalL += est.likely;
    totalP += est.pessimistic;
  }

  return threePointHours(totalO, totalL, totalP);
}

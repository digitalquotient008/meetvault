import { describe, it, expect } from 'vitest';

/**
 * Feature flag hash consistency tests.
 * Verifies the deterministic hash produces stable rollout decisions.
 */

function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function isInRollout(entityId: string, percent: number): boolean {
  return (simpleHash(entityId) % 100) < percent;
}

describe('Feature flag hash', () => {
  it('produces consistent results for same input', () => {
    const result1 = simpleHash('shop-abc123');
    const result2 = simpleHash('shop-abc123');
    expect(result1).toBe(result2);
  });

  it('produces different results for different inputs', () => {
    const result1 = simpleHash('shop-abc123');
    const result2 = simpleHash('shop-def456');
    expect(result1).not.toBe(result2);
  });

  it('0% rollout includes nobody', () => {
    const ids = Array.from({ length: 100 }, (_, i) => `shop-${i}`);
    const included = ids.filter((id) => isInRollout(id, 0));
    expect(included).toHaveLength(0);
  });

  it('100% rollout includes everybody', () => {
    const ids = Array.from({ length: 100 }, (_, i) => `shop-${i}`);
    const included = ids.filter((id) => isInRollout(id, 100));
    expect(included).toHaveLength(100);
  });

  it('50% rollout includes roughly half', () => {
    const ids = Array.from({ length: 1000 }, (_, i) => `shop-${i}`);
    const included = ids.filter((id) => isInRollout(id, 50));
    // Allow 40-60% range for statistical variance
    expect(included.length).toBeGreaterThan(400);
    expect(included.length).toBeLessThan(600);
  });

  it('25% rollout is a subset of 50% rollout', () => {
    const ids = Array.from({ length: 100 }, (_, i) => `shop-${i}`);
    const in25 = new Set(ids.filter((id) => isInRollout(id, 25)));
    const in50 = new Set(ids.filter((id) => isInRollout(id, 50)));
    // Every entity in 25% should also be in 50%
    for (const id of in25) {
      expect(in50.has(id)).toBe(true);
    }
  });
});

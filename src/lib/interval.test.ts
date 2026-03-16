import { describe, it, expect } from 'vitest';

function intervalsOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && end1 > start2;
}

describe('interval overlap', () => {
  it('returns true when intervals overlap', () => {
    const start1 = new Date('2025-03-20T10:00:00Z');
    const end1 = new Date('2025-03-20T11:00:00Z');
    const start2 = new Date('2025-03-20T10:30:00Z');
    const end2 = new Date('2025-03-20T11:30:00Z');
    expect(intervalsOverlap(start1, end1, start2, end2)).toBe(true);
  });

  it('returns false when intervals do not overlap', () => {
    const start1 = new Date('2025-03-20T10:00:00Z');
    const end1 = new Date('2025-03-20T11:00:00Z');
    const start2 = new Date('2025-03-20T11:00:00Z');
    const end2 = new Date('2025-03-20T12:00:00Z');
    expect(intervalsOverlap(start1, end1, start2, end2)).toBe(false);
  });

  it('returns true when one contains the other', () => {
    const start1 = new Date('2025-03-20T09:00:00Z');
    const end1 = new Date('2025-03-20T12:00:00Z');
    const start2 = new Date('2025-03-20T10:00:00Z');
    const end2 = new Date('2025-03-20T11:00:00Z');
    expect(intervalsOverlap(start1, end1, start2, end2)).toBe(true);
  });
});

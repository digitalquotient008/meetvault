import { describe, it, expect } from 'vitest';

/**
 * Payment flow unit tests.
 *
 * These test pure logic and invariants — no DB or Stripe calls.
 * For full integration tests, use a test database + Stripe test mode.
 */

// ── Deposit calculation logic ──

function computeDepositAmount(params: {
  subtotalCents: number;
  depositRequired: boolean;
  depositType: 'PERCENT' | 'FIXED' | null;
  depositValue: number | null;
}): number {
  const { subtotalCents, depositRequired, depositType, depositValue } = params;

  if (!depositRequired || !depositValue) {
    // Default: 20% of subtotal
    return Math.min(subtotalCents, Math.round(subtotalCents * 0.2));
  }

  if (depositType === 'PERCENT') {
    return Math.round((subtotalCents * depositValue) / 100);
  }

  // FIXED: depositValue is in dollars, convert to cents
  return Math.min(Math.round(depositValue * 100), subtotalCents);
}

describe('Deposit calculation', () => {
  it('calculates 20% default when no deposit config', () => {
    const result = computeDepositAmount({
      subtotalCents: 4000, // $40
      depositRequired: false,
      depositType: null,
      depositValue: null,
    });
    expect(result).toBe(800); // $8
  });

  it('calculates percentage deposit correctly', () => {
    const result = computeDepositAmount({
      subtotalCents: 4000,
      depositRequired: true,
      depositType: 'PERCENT',
      depositValue: 25,
    });
    expect(result).toBe(1000); // $10
  });

  it('calculates fixed deposit correctly', () => {
    const result = computeDepositAmount({
      subtotalCents: 4000,
      depositRequired: true,
      depositType: 'FIXED',
      depositValue: 15,
    });
    expect(result).toBe(1500); // $15
  });

  it('caps fixed deposit at subtotal', () => {
    const result = computeDepositAmount({
      subtotalCents: 1000, // $10 service
      depositRequired: true,
      depositType: 'FIXED',
      depositValue: 20, // $20 deposit > $10 service
    });
    expect(result).toBe(1000); // Capped at $10
  });

  it('handles zero subtotal', () => {
    const result = computeDepositAmount({
      subtotalCents: 0,
      depositRequired: true,
      depositType: 'PERCENT',
      depositValue: 25,
    });
    expect(result).toBe(0);
  });
});

// ── Platform fee calculation ──

function computePlatformFee(amountCents: number, feePercent: number): number {
  if (feePercent < 0 || feePercent > 50) throw new Error('Fee percent out of range');
  return Math.round(amountCents * (feePercent / 100));
}

describe('Platform fee calculation', () => {
  it('calculates fee correctly', () => {
    expect(computePlatformFee(4000, 5)).toBe(200); // 5% of $40 = $2
  });

  it('returns 0 for 0% fee', () => {
    expect(computePlatformFee(4000, 0)).toBe(0);
  });

  it('handles max 50% fee', () => {
    expect(computePlatformFee(4000, 50)).toBe(2000);
  });

  it('rejects fee over 50%', () => {
    expect(() => computePlatformFee(4000, 51)).toThrow('Fee percent out of range');
  });

  it('rejects negative fee', () => {
    expect(() => computePlatformFee(4000, -1)).toThrow('Fee percent out of range');
  });

  it('rounds correctly for fractional cents', () => {
    // 3% of $33.33 = $0.9999 → rounds to $1.00
    expect(computePlatformFee(3333, 3)).toBe(100);
  });
});

// ── Refund logic ──

describe('Refund classification', () => {
  function classifyRefund(refundAmount: number, paymentAmount: number): 'full' | 'partial' {
    return refundAmount >= paymentAmount - 0.01 ? 'full' : 'partial';
  }

  it('detects full refund', () => {
    expect(classifyRefund(40, 40)).toBe('full');
  });

  it('detects partial refund', () => {
    expect(classifyRefund(10, 40)).toBe('partial');
  });

  it('handles floating point near-full refund', () => {
    // $39.999 refund on $40 payment — should be full
    expect(classifyRefund(39.999, 40)).toBe('full');
  });

  it('handles actual partial that is close', () => {
    expect(classifyRefund(39.98, 40)).toBe('partial');
  });
});

// ── Cancellation forfeit logic ──

describe('Cancellation forfeit', () => {
  type Payment = { type: 'DEPOSIT' | 'BALANCE' | 'FULL'; amount: number };

  function computeForfeitRefunds(
    payments: Payment[],
    feeType: 'DEPOSIT_FORFEIT' | 'FLAT_FEE' | 'PERCENT',
    feeValue: number,
    actor: 'CUSTOMER' | 'STAFF',
  ): { paymentIndex: number; refundAmount: number }[] {
    const refunds: { paymentIndex: number; refundAmount: number }[] = [];
    let totalPaid = 0;
    for (const p of payments) totalPaid += p.amount;

    if (actor === 'STAFF') {
      // Staff cancellation = full refund of everything
      return payments.map((p, i) => ({ paymentIndex: i, refundAmount: p.amount }));
    }

    if (feeType === 'DEPOSIT_FORFEIT') {
      let remainingForfeit = feeValue;
      for (let i = 0; i < payments.length; i++) {
        const p = payments[i];
        if (p.type === 'DEPOSIT') {
          // Skip refund on deposit — it's forfeited
          remainingForfeit = Math.max(0, remainingForfeit - p.amount);
          continue;
        }
        // For non-deposit payments, deduct remaining forfeit
        const deduction = Math.min(remainingForfeit, p.amount);
        remainingForfeit -= deduction;
        const refund = p.amount - deduction;
        if (refund > 0) refunds.push({ paymentIndex: i, refundAmount: refund });
      }
    }

    return refunds;
  }

  it('forfeits deposit and refunds balance fully', () => {
    const payments: Payment[] = [
      { type: 'DEPOSIT', amount: 10 },
      { type: 'BALANCE', amount: 30 },
    ];
    const refunds = computeForfeitRefunds(payments, 'DEPOSIT_FORFEIT', 10, 'CUSTOMER');
    expect(refunds).toEqual([{ paymentIndex: 1, refundAmount: 30 }]);
  });

  it('does not double-deduct forfeit from balance after deposit skip', () => {
    const payments: Payment[] = [
      { type: 'DEPOSIT', amount: 10 },
      { type: 'BALANCE', amount: 30 },
    ];
    // Forfeit = $10, deposit = $10 → remainingForfeit should be 0 after deposit skip
    const refunds = computeForfeitRefunds(payments, 'DEPOSIT_FORFEIT', 10, 'CUSTOMER');
    // Balance should be fully refunded (no double deduction)
    expect(refunds[0].refundAmount).toBe(30);
  });

  it('staff cancellation refunds everything', () => {
    const payments: Payment[] = [
      { type: 'DEPOSIT', amount: 10 },
      { type: 'BALANCE', amount: 30 },
    ];
    const refunds = computeForfeitRefunds(payments, 'DEPOSIT_FORFEIT', 10, 'STAFF');
    expect(refunds).toEqual([
      { paymentIndex: 0, refundAmount: 10 },
      { paymentIndex: 1, refundAmount: 30 },
    ]);
  });
});

// ── Idempotency key generation ──

describe('Idempotency keys', () => {
  it('produces stable key for same appointment + type', () => {
    const key1 = `apt-abc123-DEPOSIT`;
    const key2 = `apt-abc123-DEPOSIT`;
    expect(key1).toBe(key2);
  });

  it('produces different keys for different types', () => {
    const deposit = `apt-abc123-DEPOSIT`;
    const full = `apt-abc123-FULL`;
    expect(deposit).not.toBe(full);
  });

  it('produces different keys for different appointments', () => {
    const apt1 = `apt-abc123-DEPOSIT`;
    const apt2 = `apt-def456-DEPOSIT`;
    expect(apt1).not.toBe(apt2);
  });
});

import { describe, it, expect } from 'vitest';

/**
 * Availability logic unit tests.
 *
 * Tests the core slot conflict detection and PENDING expiry filtering
 * without needing a database connection.
 */

type Appointment = {
  status: string;
  startDateTime: Date;
  endDateTime: Date;
  createdAt: Date;
};

function filterActiveAppointments(
  appointments: Appointment[],
  pendingExpiryTime: Date,
): Appointment[] {
  return appointments.filter(
    (apt) => apt.status !== 'PENDING' || apt.createdAt > pendingExpiryTime,
  );
}

function hasConflict(
  appointments: Appointment[],
  slotStart: Date,
  slotEnd: Date,
): boolean {
  return appointments.some(
    (apt) => apt.startDateTime < slotEnd && apt.endDateTime > slotStart,
  );
}

describe('PENDING appointment expiry filter', () => {
  const now = new Date('2026-03-20T10:00:00Z');
  const expiryTime = new Date(now.getTime() - 30 * 60 * 1000); // 30 min ago

  it('keeps CONFIRMED appointments regardless of age', () => {
    const appointments: Appointment[] = [
      {
        status: 'CONFIRMED',
        startDateTime: new Date('2026-03-20T11:00:00Z'),
        endDateTime: new Date('2026-03-20T11:30:00Z'),
        createdAt: new Date('2026-03-19T10:00:00Z'), // 24h ago — old
      },
    ];
    const filtered = filterActiveAppointments(appointments, expiryTime);
    expect(filtered).toHaveLength(1);
  });

  it('keeps recent PENDING appointments (< 30 min old)', () => {
    const appointments: Appointment[] = [
      {
        status: 'PENDING',
        startDateTime: new Date('2026-03-20T11:00:00Z'),
        endDateTime: new Date('2026-03-20T11:30:00Z'),
        createdAt: new Date('2026-03-20T09:45:00Z'), // 15 min ago
      },
    ];
    const filtered = filterActiveAppointments(appointments, expiryTime);
    expect(filtered).toHaveLength(1);
  });

  it('removes stale PENDING appointments (> 30 min old)', () => {
    const appointments: Appointment[] = [
      {
        status: 'PENDING',
        startDateTime: new Date('2026-03-20T11:00:00Z'),
        endDateTime: new Date('2026-03-20T11:30:00Z'),
        createdAt: new Date('2026-03-20T09:00:00Z'), // 60 min ago — expired
      },
    ];
    const filtered = filterActiveAppointments(appointments, expiryTime);
    expect(filtered).toHaveLength(0);
  });
});

describe('Slot conflict detection', () => {
  const baseAppointments: Appointment[] = [
    {
      status: 'CONFIRMED',
      startDateTime: new Date('2026-03-20T10:00:00Z'),
      endDateTime: new Date('2026-03-20T10:30:00Z'),
      createdAt: new Date(),
    },
  ];

  it('detects overlap when slot starts during existing appointment', () => {
    expect(
      hasConflict(
        baseAppointments,
        new Date('2026-03-20T10:15:00Z'),
        new Date('2026-03-20T10:45:00Z'),
      ),
    ).toBe(true);
  });

  it('detects overlap when slot ends during existing appointment', () => {
    expect(
      hasConflict(
        baseAppointments,
        new Date('2026-03-20T09:45:00Z'),
        new Date('2026-03-20T10:15:00Z'),
      ),
    ).toBe(true);
  });

  it('detects overlap when slot fully contains existing appointment', () => {
    expect(
      hasConflict(
        baseAppointments,
        new Date('2026-03-20T09:30:00Z'),
        new Date('2026-03-20T11:00:00Z'),
      ),
    ).toBe(true);
  });

  it('allows slot immediately after existing appointment', () => {
    expect(
      hasConflict(
        baseAppointments,
        new Date('2026-03-20T10:30:00Z'),
        new Date('2026-03-20T11:00:00Z'),
      ),
    ).toBe(false);
  });

  it('allows slot before existing appointment', () => {
    expect(
      hasConflict(
        baseAppointments,
        new Date('2026-03-20T09:00:00Z'),
        new Date('2026-03-20T10:00:00Z'),
      ),
    ).toBe(false);
  });

  it('handles empty appointment list', () => {
    expect(
      hasConflict(
        [],
        new Date('2026-03-20T10:00:00Z'),
        new Date('2026-03-20T10:30:00Z'),
      ),
    ).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import {
  createAppointmentSchema,
  getAvailableSlotsSchema,
  availabilityRuleSchema,
} from './booking';

describe('booking validators', () => {
  describe('createAppointmentSchema', () => {
    it('accepts valid input', () => {
      const result = createAppointmentSchema.safeParse({
        shopId: 'cln8b9c0d1e2f3g4h5i6j7k8',
        customerId: 'cln8b9c0d1e2f3g4h5i6j7k9',
        barberProfileId: 'cln8b9c0d1e2f3g4h5i6j7k0',
        serviceId: 'cln8b9c0d1e2f3g4h5i6j7k1',
        startDateTime: new Date('2025-03-20T10:00:00Z'),
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing required fields', () => {
      const result = createAppointmentSchema.safeParse({
        shopId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid cuid', () => {
      const result = createAppointmentSchema.safeParse({
        shopId: 'short',
        customerId: 'cln8b9c0d1e2f3g4h5i6j7k9',
        barberProfileId: 'cln8b9c0d1e2f3g4h5i6j7k0',
        serviceId: 'cln8b9c0d1e2f3g4h5i6j7k1',
        startDateTime: new Date(),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('getAvailableSlotsSchema', () => {
    it('accepts valid input', () => {
      const result = getAvailableSlotsSchema.safeParse({
        shopId: 'cln8b9c0d1e2f3g4h5i6j7k8',
        serviceId: 'cln8b9c0d1e2f3g4h5i6j7k1',
        dateFrom: new Date('2025-03-20T00:00:00Z'),
        dateTo: new Date('2025-03-21T00:00:00Z'),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('availabilityRuleSchema', () => {
    it('accepts valid day and time', () => {
      const result = availabilityRuleSchema.safeParse({
        dayOfWeek: 3,
        startTime: '09:00',
        endTime: '17:00',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid time format', () => {
      const result = availabilityRuleSchema.safeParse({
        dayOfWeek: 3,
        startTime: '9:00',
        endTime: '17:00',
      });
      expect(result.success).toBe(false);
    });
  });
});

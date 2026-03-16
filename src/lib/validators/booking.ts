import { z } from 'zod';

export const availabilityRuleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const setAvailabilityRulesSchema = z.object({
  barberProfileId: z.string().cuid(),
  rules: z.array(availabilityRuleSchema),
});

export const timeOffSchema = z.object({
  barberProfileId: z.string().cuid(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  reason: z.string().max(500).optional(),
});

export const createAppointmentSchema = z.object({
  shopId: z.string().cuid(),
  customerId: z.string().cuid(),
  barberProfileId: z.string().cuid(),
  serviceId: z.string().cuid(),
  startDateTime: z.coerce.date(),
  customerDetails: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
  }).optional(),
});

export const getAvailableSlotsSchema = z.object({
  shopId: z.string().cuid(),
  barberProfileId: z.string().cuid().optional(),
  serviceId: z.string().cuid(),
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type GetAvailableSlotsInput = z.infer<typeof getAvailableSlotsSchema>;

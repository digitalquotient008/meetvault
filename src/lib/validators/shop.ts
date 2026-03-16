import { z } from 'zod';

export const createShopSchema = z.object({
  name: z.string().min(1, 'Shop name is required').max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug: lowercase letters, numbers, hyphens only'),
  timezone: z.string().min(1).default('America/New_York'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  addressLine1: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(2).default('US'),
  cancellationPolicy: z.string().max(2000).optional(),
  depositRequired: z.boolean().default(false),
  depositType: z.enum(['FIXED', 'PERCENT']).optional(),
  depositValue: z.number().min(0).optional(),
  tippingEnabled: z.boolean().default(true),
  brandPrimaryColor: z.string().max(20).optional(),
  brandSecondaryColor: z.string().max(20).optional(),
});

export const updateShopSchema = createShopSchema.partial();

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;

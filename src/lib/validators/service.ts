import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(200),
  description: z.string().max(2000).optional(),
  durationMin: z.number().int().min(5).max(480),
  price: z.number().min(0),
  depositEligible: z.boolean().default(false),
  category: z.string().max(100).optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

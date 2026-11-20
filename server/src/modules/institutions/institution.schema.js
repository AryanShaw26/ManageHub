import { z } from 'zod';

export const updateInstitutionSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(180).optional(),
    email: z.string().trim().email('Invalid email address').max(255).optional(),
    phone: z.string().trim().max(30).optional().nullable(),
    address: z.string().trim().optional().nullable(),
  }),
});

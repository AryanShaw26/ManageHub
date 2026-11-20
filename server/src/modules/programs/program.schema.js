import { z } from 'zod';

export const createProgramSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Program name must be at least 2 characters').max(150),
    department: z.string().trim().max(150).optional().nullable(),
    durationYears: z.number().int().min(1).max(10).default(4),
  }),
});

export const updateProgramSchema = z.object({
  params: z.object({
    programId: z.string().uuid('Invalid program ID'),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(150).optional(),
    department: z.string().trim().max(150).optional().nullable(),
    durationYears: z.number().int().min(1).max(10).optional(),
  }),
});

export const programIdParamSchema = z.object({
  params: z.object({
    programId: z.string().uuid('Invalid program ID'),
  }),
});

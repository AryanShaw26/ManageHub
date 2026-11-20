import { z } from 'zod';

export const createClassSchema = z.object({
  body: z.object({
    programId: z.string().uuid('Invalid program ID'),
    name: z.string().trim().min(2, 'Class name is required').max(150),
    batchYear: z.number().int().min(1990).max(2100),
    section: z.string().trim().max(30).optional().nullable(),
  }),
});

export const updateClassSchema = z.object({
  params: z.object({
    classId: z.string().uuid('Invalid class ID'),
  }),
  body: z.object({
    programId: z.string().uuid('Invalid program ID').optional(),
    name: z.string().trim().min(2).max(150).optional(),
    batchYear: z.number().int().min(1990).max(2100).optional(),
    section: z.string().trim().max(30).optional().nullable(),
  }),
});

export const classIdParamSchema = z.object({
  params: z.object({
    classId: z.string().uuid('Invalid class ID'),
  }),
});

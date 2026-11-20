import { z } from 'zod';

const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password cannot exceed 100 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one number or special character')
  .refine((val) => val.trim().length === val.length, {
    message: 'Password cannot begin or end with whitespace',
  });

export const createFacultySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
    email: z.string().trim().email('Invalid email address').max(255).toLowerCase(),
    password: passwordValidation,
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    role: z.enum(['ADMIN', 'FACULTY']),
  }),
});

export const assignClassFacultySchema = z.object({
  params: z.object({
    classId: z.string().uuid('Invalid class ID'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
});

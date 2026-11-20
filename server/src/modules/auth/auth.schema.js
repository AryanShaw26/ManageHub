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

export const registerInstitutionSchema = z.object({
  body: z.object({
    institutionName: z.string().trim().min(2, 'Institution name must be at least 2 characters').max(180),
    institutionEmail: z.string().trim().email('Invalid institution email').max(255).toLowerCase(),
    adminName: z.string().trim().min(2, 'Administrator name must be at least 2 characters').max(150),
    adminEmail: z.string().trim().email('Invalid administrator email').max(255).toLowerCase(),
    password: passwordValidation,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    phone: z.string().trim().max(30).optional(),
    address: z.string().trim().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address').max(255).toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
});

import { z } from 'zod';

export const listStudentsSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    classId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
});

export const createStudentSchema = z.object({
  body: z.object({
    classId: z.string().uuid('Invalid class ID'),
    studentName: z.string().trim().min(2, 'Student name is required').max(150),
    enrollmentNumber: z.string().trim().min(1, 'Enrollment number is required').max(80),
    rollNumber: z.string().trim().min(1, 'Roll number is required').max(40),
    email: z.string().trim().email('Invalid email').max(255).optional().nullable(),
    phone: z.string().trim().max(30).optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    admissionYear: z.number().int().min(1990).max(2100),
  }),
});

export const updateStudentSchema = z.object({
  params: z.object({
    studentId: z.string().uuid('Invalid student ID'),
  }),
  body: z.object({
    classId: z.string().uuid('Invalid class ID').optional(),
    studentName: z.string().trim().min(2).max(150).optional(),
    enrollmentNumber: z.string().trim().min(1).max(80).optional(),
    rollNumber: z.string().trim().min(1).max(40).optional(),
    email: z.string().trim().email('Invalid email').max(255).optional().nullable(),
    phone: z.string().trim().max(30).optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    admissionYear: z.number().int().min(1990).max(2100).optional(),
  }),
});

export const studentIdParamSchema = z.object({
  params: z.object({
    studentId: z.string().uuid('Invalid student ID'),
  }),
});

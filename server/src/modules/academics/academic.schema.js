import { z } from 'zod';

export const createSubjectSchema = z.object({
  params: z.object({
    semesterId: z.string().uuid('Invalid semester ID'),
  }),
  body: z.object({
    subjectCode: z.string().trim().min(1, 'Subject code is required').max(50),
    subjectName: z.string().trim().min(2, 'Subject name is required').max(180),
    maxMarks: z.coerce.number().positive('Maximum marks must be greater than zero').max(1000),
    credits: z.coerce.number().nonnegative().optional().nullable(),
  }),
});

export const updateSubjectSchema = z.object({
  params: z.object({
    subjectId: z.string().uuid('Invalid subject ID'),
  }),
  body: z.object({
    subjectCode: z.string().trim().min(1).max(50).optional(),
    subjectName: z.string().trim().min(2).max(180).optional(),
    maxMarks: z.coerce.number().positive().max(1000).optional(),
    credits: z.coerce.number().nonnegative().optional().nullable(),
  }),
});

export const recordMarksSchema = z.object({
  params: z.object({
    studentId: z.string().uuid('Invalid student ID'),
  }),
  body: z.object({
    subjectId: z.string().uuid('Invalid subject ID'),
    marksObtained: z.coerce.number().min(0, 'Marks obtained cannot be negative'),
    grade: z.string().trim().max(10).optional().nullable(),
    resultStatus: z.enum(['PASS', 'FAIL', 'ABSENT']).optional().nullable(),
  }),
});

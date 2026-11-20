import { Router } from 'express';
import * as academicController from './academic.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createSubjectSchema,
  updateSubjectSchema,
  recordMarksSchema,
} from './academic.schema.js';

const router = Router();

router.use(authenticate);

// Semesters & Subjects
router.get('/programs/:programId/semesters', academicController.listProgramSemesters);
router.post('/semesters/:semesterId/subjects', requireRole('ADMIN'), validateRequest(createSubjectSchema), academicController.createSubject);
router.get('/semesters/:semesterId/subjects', academicController.listSemesterSubjects);
router.patch('/subjects/:subjectId', requireRole('ADMIN'), validateRequest(updateSubjectSchema), academicController.updateSubject);

// Marks
router.post('/students/:studentId/marks', validateRequest(recordMarksSchema), academicController.recordMarks);
router.get('/students/:studentId/marks', academicController.getStudentMarks);

export default router;

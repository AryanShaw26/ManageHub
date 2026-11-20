import { Router } from 'express';
import * as studentController from './student.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  listStudentsSchema,
  createStudentSchema,
  updateStudentSchema,
  studentIdParamSchema,
} from './student.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', validateRequest(listStudentsSchema), studentController.listStudents);
router.post('/', validateRequest(createStudentSchema), studentController.createStudent);
router.get('/:studentId', validateRequest(studentIdParamSchema), studentController.getStudent);
router.patch('/:studentId', validateRequest(updateStudentSchema), studentController.updateStudent);
router.delete('/:studentId', requireRole('ADMIN'), validateRequest(studentIdParamSchema), studentController.archiveStudent);

export default router;

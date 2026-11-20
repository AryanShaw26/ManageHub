import { Router } from 'express';
import * as classController from './class.controller.js';
import * as userController from '../users/user.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { createClassSchema, updateClassSchema, classIdParamSchema } from './class.schema.js';
import { assignClassFacultySchema } from '../users/user.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', classController.listClasses);
router.post('/', requireRole('ADMIN'), validateRequest(createClassSchema), classController.createClass);
router.get('/:classId', validateRequest(classIdParamSchema), classController.getClass);
router.patch('/:classId', requireRole('ADMIN'), validateRequest(updateClassSchema), classController.updateClass);
router.delete('/:classId', requireRole('ADMIN'), validateRequest(classIdParamSchema), classController.archiveClass);

// Faculty class assignment routes (ADMIN only)
router.post('/:classId/faculty', requireRole('ADMIN'), validateRequest(assignClassFacultySchema), userController.assignClassFaculty);
router.delete('/:classId/faculty/:userId', requireRole('ADMIN'), userController.removeClassFaculty);

export default router;

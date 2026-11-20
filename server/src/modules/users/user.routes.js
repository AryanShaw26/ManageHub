import { Router } from 'express';
import * as userController from './user.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { createFacultySchema, updateRoleSchema } from './user.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN'), userController.listMembers);
router.post('/faculty', requireRole('ADMIN'), validateRequest(createFacultySchema), userController.createFaculty);
router.patch('/:userId/role', requireRole('ADMIN'), validateRequest(updateRoleSchema), userController.updateRole);

export default router;

import { Router } from 'express';
import * as programController from './program.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { createProgramSchema, updateProgramSchema, programIdParamSchema } from './program.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', programController.listPrograms);
router.post('/', requireRole('ADMIN'), validateRequest(createProgramSchema), programController.createProgram);
router.get('/:programId', validateRequest(programIdParamSchema), programController.getProgram);
router.patch('/:programId', requireRole('ADMIN'), validateRequest(updateProgramSchema), programController.updateProgram);
router.delete('/:programId', requireRole('ADMIN'), validateRequest(programIdParamSchema), programController.archiveProgram);

export default router;

import { Router } from 'express';
import * as institutionController from './institution.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { updateInstitutionSchema } from './institution.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', institutionController.getInstitution);
router.patch('/', requireRole('ADMIN'), validateRequest(updateInstitutionSchema), institutionController.updateInstitution);

export default router;

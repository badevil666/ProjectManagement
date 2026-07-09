import { Router } from 'express';
import * as projectController from '../controllers/projectController';
import { validateBody, validateQuery } from '../middlewares/validate';
import {
  projectCreateSchema,
  projectListQuerySchema,
  projectUpdateSchema,
} from '../validators/projectValidators';

const router = Router();

router.get('/', validateQuery(projectListQuerySchema), projectController.listProjects);
router.post('/', validateBody(projectCreateSchema), projectController.createProject);
router.get('/:id', projectController.getProject);
router.put('/:id', validateBody(projectUpdateSchema), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.get('/:id/timeline', projectController.getProjectTimeline);

export default router;

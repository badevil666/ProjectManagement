import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { validateQuery } from '../middlewares/validate';
import { dashboardActivityQuerySchema } from '../validators/dashboardValidators';

const router = Router();

router.get('/stats', dashboardController.getStats);
router.get(
  '/activity',
  validateQuery(dashboardActivityQuerySchema),
  dashboardController.getActivity,
);

export default router;

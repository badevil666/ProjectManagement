import { Router } from 'express';
import * as authController from '../controllers/authController';
import { requireAdmin } from '../middlewares/requireAdmin';
import { requireAuth } from '../middlewares/requireAuth';
import { validateBody } from '../middlewares/validate';
import { loginSchema } from '../validators/authValidators';

const router = Router();

router.post('/login', validateBody(loginSchema), authController.login);
router.get('/me', requireAuth, requireAdmin, authController.me);

export default router;

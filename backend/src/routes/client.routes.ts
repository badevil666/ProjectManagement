import { Router } from 'express';
import * as clientController from '../controllers/clientController';
import { validateBody, validateQuery } from '../middlewares/validate';
import {
  clientCreateSchema,
  clientListQuerySchema,
  clientUpdateSchema,
} from '../validators/clientValidators';

const router = Router();

router.get('/', validateQuery(clientListQuerySchema), clientController.listClients);
router.post('/', validateBody(clientCreateSchema), clientController.createClient);
router.get('/:id', clientController.getClient);
router.put('/:id', validateBody(clientUpdateSchema), clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

export default router;

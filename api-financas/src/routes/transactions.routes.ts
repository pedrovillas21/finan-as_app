import { Router } from 'express';
import { list, create, update, remove } from '../controllers/transactions.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { transactionSchema, transactionUpdateSchema } from '../validators/transaction.validators';

const router = Router();

router.use(authenticate);

router.get('/',     list);
router.post('/',    validate(transactionSchema),       create);
router.put('/:id',  validate(transactionUpdateSchema), update);
router.delete('/:id', remove);

export default router;

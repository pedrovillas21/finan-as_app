import { Router } from 'express';
import { list, create } from '../controllers/categories.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { categorySchema } from '../validators/category.validators';

const router = Router();

router.use(authenticate);

router.get('/',  list);
router.post('/', validate(categorySchema), create);

export default router;

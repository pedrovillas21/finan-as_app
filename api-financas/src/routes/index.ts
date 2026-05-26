import { Router } from 'express';
import authRoutes         from './auth.routes';
import categoriesRoutes   from './categories.routes';
import transactionsRoutes from './transactions.routes';

const router = Router();

router.get('/', (_req, res) => res.json({ ok: true, name: 'gestao-financeira-api' }));

router.use('/auth',         authRoutes);
router.use('/categories',   categoriesRoutes);
router.use('/transactions', transactionsRoutes);

export default router;

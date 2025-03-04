import { Router } from 'express';
import botRoutes from './botRoutes';
import logRoutes from './logRoutes';
import { authMiddleware } from '../middleware/auth';
const router = Router();
// Rotas protegidas por autenticação
router.use('/bots', authMiddleware, botRoutes);
router.use('/logs', authMiddleware, logRoutes);
export default router;

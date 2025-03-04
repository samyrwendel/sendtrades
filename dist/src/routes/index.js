import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { UserController } from '../controllers/userController';
const router = Router();
// Rotas públicas
router.post('/login', UserController.login);
router.post('/register', UserController.register);
// Rotas protegidas
router.use(authMiddleware);
router.get('/profile', UserController.profile);
router.put('/update', UserController.update);
export default router;

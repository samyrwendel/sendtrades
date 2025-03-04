import express, { RequestHandler } from 'express';
import { WebhookController } from '../controllers/webhookController';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 60 // limite de 60 requisições por minuto
});

// Rota para receber sinais de trading
router.post('/', limiter, WebhookController.handleSignal as RequestHandler);

export default router; 
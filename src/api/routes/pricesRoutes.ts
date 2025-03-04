import express, { RequestHandler } from 'express';
import { PricesController } from '../controllers/pricesController';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter - 30 requisições por minuto
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30 // limite de 30 requisições por minuto
});

// Rota para buscar preços
router.post('/', limiter, PricesController.getPrices as RequestHandler);

export default router; 
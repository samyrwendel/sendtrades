import { z } from 'zod';
import { Queue } from './utils/queue';
import { getExchange } from './exchanges';
import { useBotStore } from './botStore';
import { logger } from './utils/logger';
// Schema para validação das ordens recebidas
const OrderSchema = z.object({
    botId: z.string(),
    action: z.enum(['BUY', 'SELL']),
    symbol: z.string(),
    amount: z.string(),
    timestamp: z.number(),
    signature: z.string(),
});
// Fila de processamento de ordens
const orderQueue = new Queue();
// Cache de bots para evitar consultas frequentes ao store
let botsCache = [];
// Atualiza o cache quando os bots são modificados
window.addEventListener('botsUpdated', () => {
    botsCache = useBotStore.getState().bots;
});
/**
 * Valida a assinatura da ordem recebida
 */
function validateOrderSignature(order, signature, secretKey) {
    // Implementar validação de assinatura HMAC
    // TODO: Implementar usando a mesma lógica de assinatura das exchanges
    return true;
}
/**
 * Processa uma ordem individual
 */
async function processOrder(order) {
    try {
        logger.info('Processando ordem', { orderId: order.botId, action: order.action });
        // Encontra o bot correspondente
        const bot = botsCache.find(b => b.id === order.botId);
        if (!bot) {
            logger.error('Bot não encontrado', { botId: order.botId });
            return false;
        }
        // Verifica se o bot está ativo
        if (bot.status !== 'active') {
            logger.warn('Bot não está ativo', { botId: bot.id, status: bot.status });
            return false;
        }
        // Obtém a instância da exchange
        const exchange = getExchange(bot.exchange.name);
        if (!exchange) {
            logger.error('Exchange não encontrada', { exchangeName: bot.exchange.name });
            return false;
        }
        // Executa a ordem
        const result = await exchange.executeTrade(bot.exchange.credentials, {
            symbol: order.symbol,
            amount: order.amount,
            type: order.action.toLowerCase()
        });
        if (!result.success) {
            logger.error('Falha ao executar ordem', {
                botId: bot.id,
                error: result.error
            });
            return false;
        }
        logger.info('Ordem executada com sucesso', {
            botId: bot.id,
            orderId: result.orderId,
            action: order.action,
            symbol: order.symbol
        });
        return true;
    }
    catch (error) {
        logger.error('Erro ao processar ordem', {
            botId: order.botId,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        return false;
    }
}
/**
 * Inicia o processador de ordens
 */
function startOrderProcessor() {
    setInterval(async () => {
        if (orderQueue.isEmpty())
            return;
        const order = orderQueue.dequeue();
        if (!order)
            return;
        await processOrder(order);
    }, 1000); // Processa uma ordem a cada segundo
}
/**
 * Recebe e valida uma nova ordem via webhook
 */
export async function handleWebhookOrder(payload) {
    try {
        // Valida o formato da ordem
        const validationResult = OrderSchema.safeParse(payload);
        if (!validationResult.success) {
            return {
                success: false,
                error: 'Formato de ordem inválido'
            };
        }
        const order = validationResult.data;
        // Encontra o bot
        const bot = botsCache.find(b => b.id === order.botId);
        if (!bot) {
            return {
                success: false,
                error: 'Bot não encontrado'
            };
        }
        // Valida a assinatura
        if (!validateOrderSignature({
            botId: order.botId,
            action: order.action,
            symbol: order.symbol,
            amount: order.amount,
            timestamp: order.timestamp
        }, order.signature, bot.exchange.credentials.secretKey)) {
            return {
                success: false,
                error: 'Assinatura inválida'
            };
        }
        // Valida o timestamp (não pode ser muito antigo)
        const MAX_ORDER_AGE = 5 * 60 * 1000; // 5 minutos
        if (Date.now() - order.timestamp > MAX_ORDER_AGE) {
            return {
                success: false,
                error: 'Ordem expirada'
            };
        }
        // Adiciona a ordem à fila
        orderQueue.enqueue(order);
        logger.info('Ordem recebida e enfileirada', {
            botId: order.botId,
            action: order.action,
            symbol: order.symbol
        });
        return {
            success: true,
            message: 'Ordem aceita e enfileirada'
        };
    }
    catch (error) {
        logger.error('Erro ao processar webhook', {
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            payload
        });
        return {
            success: false,
            error: 'Erro interno ao processar ordem'
        };
    }
}
// Inicia o processador de ordens
startOrderProcessor();

import { addLog } from './logUtils';
import { getExchange } from './exchanges';
import { calculateOrderQuantity } from './orderCalculator';
import { logger } from './utils/logger';
export async function validateWebhookRequest(payload, bot, clientIp) {
    console.log('🔍 Validando webhook request:', { payload, bot, clientIp });
    // Validar schema
    if (payload.schema !== '2') {
        console.log('❌ Schema inválido:', payload.schema);
        await addLog({
            botId: bot.id,
            type: 'webhook',
            action: 'system',
            message: 'Schema inválido',
            details: `Schema esperado: 2, recebido: ${payload.schema}`,
            status: 'error',
            clientip: clientIp,
            userId: bot.userId,
            public_id: bot.public_id,
            payload
        });
        return { isValid: false, error: 'Schema inválido. Use schema: "2"' };
    }
    // Validar public_id
    if (payload.public_id !== bot.public_id) {
        console.log('❌ Bot ID inválido:', { payloadId: payload.public_id, publicId: bot.public_id });
        await addLog({
            botId: bot.id,
            type: 'webhook',
            action: 'system',
            message: 'Bot ID inválido',
            details: `ID esperado: ${bot.public_id}, recebido: ${payload.public_id}`,
            status: 'error',
            clientip: clientIp,
            userId: bot.userId,
            public_id: bot.public_id,
            payload
        });
        return { isValid: false, error: 'Bot ID inválido' };
    }
    // Validar ticker
    if (payload.ticker !== bot.tradingPair) {
        console.log('❌ Par de trading inválido:', { payloadTicker: payload.ticker, botTicker: bot.tradingPair });
        await addLog({
            botId: bot.id,
            type: 'webhook',
            action: 'system',
            message: 'Par de trading inválido',
            details: `Par esperado: ${bot.tradingPair}, recebido: ${payload.ticker}`,
            status: 'error',
            clientip: clientIp,
            userId: bot.userId,
            public_id: bot.public_id,
            payload
        });
        return { isValid: false, error: 'Par de trading inválido' };
    }
    // Validar IPs permitidos apenas se houver uma lista configurada
    const allowedIPs = bot.webhook?.allowedIPs || [];
    if (allowedIPs.length > 0) {
        // Normaliza o IP do cliente
        const normalizedClientIP = clientIp.replace(/^::ffff:/, '');
        // Verifica se o IP está na lista de permitidos
        const isAllowed = allowedIPs.some(allowedIP => {
            const normalizedAllowedIP = allowedIP.trim().replace(/^::ffff:/, '');
            return normalizedClientIP === normalizedAllowedIP;
        });
        if (!isAllowed) {
            console.log('❌ IP não autorizado:', { clientIp, allowedIPs });
            await addLog({
                botId: bot.id,
                type: 'webhook',
                action: 'system',
                message: 'IP não autorizado',
                details: `IP: ${clientIp} não está na lista de IPs permitidos: ${allowedIPs.join(', ')}`,
                status: 'error',
                clientip: clientIp,
                userId: bot.userId,
                public_id: bot.public_id,
                payload
            });
            return { isValid: false, error: 'IP não autorizado' };
        }
    }
    // Se não houver lista de IPs configurada, permite todos
    // Validar action
    if (!['buy', 'sell'].includes(payload.action)) {
        console.log('❌ Ação inválida:', payload.action);
        await addLog({
            botId: bot.id,
            type: 'webhook',
            action: 'system',
            message: 'Ação inválida',
            details: `Ação deve ser "buy" ou "sell", recebido: ${payload.action}`,
            status: 'error',
            clientip: clientIp,
            userId: bot.userId,
            public_id: bot.public_id,
            payload
        });
        return { isValid: false, error: 'Ação inválida. Use "buy" ou "sell"' };
    }
    // Validar timestamp (não mais antigo que 5 minutos)
    const payloadTime = new Date(payload.timestamp).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    if (isNaN(payloadTime) || Math.abs(now - payloadTime) > fiveMinutes) {
        console.log('❌ Timestamp inválido:', { payloadTime, now, diff: Math.abs(now - payloadTime) });
        await addLog({
            botId: bot.id,
            type: 'webhook',
            action: 'system',
            message: 'Timestamp inválido',
            details: `Timestamp muito antigo ou inválido: ${payload.timestamp}`,
            status: 'error',
            clientip: clientIp,
            userId: bot.userId,
            public_id: bot.public_id,
            payload
        });
        return { isValid: false, error: 'Timestamp inválido ou muito antigo' };
    }
    console.log('✅ Webhook validado com sucesso');
    await addLog({
        botId: bot.id,
        type: 'webhook',
        action: 'system',
        message: 'Webhook validado com sucesso',
        details: 'Todas as validações passaram',
        status: 'success',
        clientip: clientIp,
        userId: bot.userId,
        public_id: bot.public_id,
        payload
    });
    return { isValid: true };
}
export async function processWebhookRequest(payload, bot, clientIp) {
    try {
        // Validar payload
        if (!payload.action || !payload.ticker || !payload.public_id) {
            throw new Error('Payload inválido');
        }
        // Validar order_size
        if (!payload.order_size || typeof payload.order_size !== 'string') {
            throw new Error('order_size inválido: deve ser uma string');
        }
        // Validar ação
        if (!['buy', 'sell'].includes(payload.action.toLowerCase())) {
            throw new Error('Ação inválida');
        }
        // Converter e validar timestamp do webhook
        const webhookTimestamp = new Date(payload.timestamp).getTime();
        if (isNaN(webhookTimestamp)) {
            throw new Error('Timestamp do webhook inválido');
        }
        // Se o timestamp não estiver em milissegundos (13 dígitos), converter
        const timestampStr = String(webhookTimestamp);
        const finalTimestamp = timestampStr.length === 10
            ? webhookTimestamp * 1000
            : webhookTimestamp;
        // Log detalhado do timestamp
        logger.info('Processando timestamp do webhook', {
            original: {
                value: payload.timestamp,
                type: typeof payload.timestamp
            },
            parsed: {
                value: webhookTimestamp,
                digits: timestampStr.length,
                iso: new Date(webhookTimestamp).toISOString()
            },
            final: {
                value: finalTimestamp,
                digits: String(finalTimestamp).length,
                iso: new Date(finalTimestamp).toISOString()
            }
        });
        // Obter exchange configurada
        const exchange = getExchange(bot.exchange.name);
        if (!exchange) {
            throw new Error('Exchange não configurada');
        }
        logger.info('🔄 Obtendo saldos da exchange...', {
            botId: bot.id,
            exchange: bot.exchange.name
        });
        // Adicionar botId às credenciais
        const credentials = {
            ...bot.exchange.config.credentials,
            botId: bot.id
        };
        // Calcular quantidade da ordem
        const orderCalc = await calculateOrderQuantity(await exchange.getBalances(credentials), typeof payload.order_size === 'string' ? payload.order_size : String(payload.order_size), payload.ticker, await exchange.getCurrentPrice(payload.ticker), payload.action.toLowerCase());
        if (!orderCalc) {
            throw new Error('Erro ao calcular ordem');
        }
        logger.info('✅ Quantidade calculada com sucesso', {
            botId: bot.id,
            quantity: orderCalc.quantity,
            baseAmount: orderCalc.baseAmount,
            quoteAmount: orderCalc.quoteAmount,
            price: orderCalc.price,
            baseAsset: orderCalc.baseAsset,
            quoteAsset: orderCalc.quoteAsset
        });
        // Executar a ordem usando o timestamp do webhook
        const tradeResult = await exchange.executeTrade(credentials, {
            symbol: payload.ticker,
            amount: orderCalc.quantity.toString(),
            type: payload.action.toLowerCase(),
            timestamp: finalTimestamp
        });
        if (!tradeResult.success) {
            // Registrar erro de execução com mais detalhes
            await addLog({
                botId: bot.id,
                type: 'webhook_execution_error',
                action: payload.action,
                message: 'Erro ao executar ordem',
                details: `Falha na execução:
          Erro: ${tradeResult.error}
          Par: ${payload.ticker}
          Quantidade: ${orderCalc.quantity}
          Valor: ${orderCalc.quoteAmount} USDT
          Preço: ${orderCalc.price}
          Timestamp: ${new Date(finalTimestamp).toISOString()}`,
                status: 'error',
                clientip: clientIp,
                userId: bot.userId,
                public_id: bot.public_id,
                payload: {
                    ...payload,
                    calculation: orderCalc,
                    error: tradeResult.error
                }
            });
            throw new Error(tradeResult.error || 'Erro ao executar ordem');
        }
        logger.info('✅ Ordem executada com sucesso', {
            botId: bot.id,
            orderId: tradeResult.orderId,
            symbol: payload.ticker,
            action: payload.action,
            amount: orderCalc.quantity,
            webhookTimestamp: new Date(finalTimestamp).toISOString()
        });
        // Logar sucesso com mais detalhes
        await addLog({
            botId: bot.id,
            type: 'webhook_executed',
            action: payload.action.toLowerCase(),
            message: `Ordem executada: ${payload.action.toUpperCase()} ${payload.ticker}`,
            details: `Execução concluída com sucesso:
        IP: ${clientIp}
        Ação: ${payload.action}
        Par: ${payload.ticker}
        Tamanho Original: ${payload.order_size}
        Quantidade Base: ${orderCalc.quantity} ${orderCalc.baseAsset}
        Valor Total: ${orderCalc.quoteAmount} ${orderCalc.quoteAsset}
        Preço Executado: ${orderCalc.price}
        Order ID: ${tradeResult.orderId}
        Timestamp: ${new Date(finalTimestamp).toISOString()}
        Precisão Base: ${orderCalc.metadata?.precision?.base || 'N/A'}
        Precisão Quote: ${orderCalc.metadata?.precision?.quote || 'N/A'}`,
            status: 'success',
            clientip: clientIp,
            userId: bot.userId,
            public_id: bot.public_id,
            payload: {
                ...payload,
                calculation: orderCalc,
                execution: {
                    orderId: tradeResult.orderId,
                    timestamp: finalTimestamp,
                    price: orderCalc.price
                }
            }
        });
        return {
            success: true,
            message: `Ordem executada com sucesso. Order ID: ${tradeResult.orderId}`
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger.error('❌ Erro ao processar webhook:', {
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            payload
        });
        // Determinar o tipo de erro com mais precisão
        let errorType = 'webhook_error';
        let message = 'Erro ao processar webhook';
        if (errorMessage.includes('Saldo insuficiente') ||
            errorMessage.includes('Quantidade calculada') ||
            errorMessage.includes('Erro ao calcular') ||
            errorMessage.includes('limite máximo')) {
            errorType = 'webhook_calculation_error';
            message = 'Erro ao calcular ordem';
        }
        else if (errorMessage.includes('Erro ao executar ordem') ||
            errorMessage.includes('Failed to execute order')) {
            errorType = 'webhook_execution_error';
            message = 'Erro ao executar ordem';
        }
        await addLog({
            botId: bot.id,
            type: errorType,
            action: payload.action,
            message: message,
            details: errorMessage,
            status: 'error',
            clientip: clientIp,
            userId: bot.userId,
            public_id: bot.public_id,
            payload: {
                ...payload,
                error: {
                    message: errorMessage,
                    type: errorType,
                    timestamp: new Date().toISOString()
                }
            }
        });
        return { success: false, message: errorMessage };
    }
}

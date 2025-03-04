import { logger } from '../../config/logger';
import { validateWebhookPayload } from '../../lib/utils/validation';
import { supabaseAdmin } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
export class WebhookController {
    static async handleSignal(req, res) {
        try {
            const payload = req.body;
            const timestamp = new Date();
            const clientIp = req.ip || 'unknown';
            logger.info('📥 Webhook recebido:', {
                payload,
                timestamp,
                clientIp
            });
            // Validação do payload
            try {
                const validationResult = validateWebhookPayload(payload);
                logger.info('🔍 Resultado da validação:', validationResult);
                if (!validationResult) {
                    // Extrair Base Asset e Quote Asset do ticker
                    const baseAsset = payload.ticker ? payload.ticker.slice(0, -4) : 'Base Asset';
                    const quoteAsset = payload.ticker ? payload.ticker.slice(-4) : 'Quote Asset';
                    const errorLog = {
                        id: uuidv4(),
                        botId: null,
                        public_id: payload.public_id || 'unknown',
                        type: 'webhook_error',
                        message: payload.action === 'buy'
                            ? `Valor da ordem (0 ${quoteAsset}) é menor que o mínimo permitido`
                            : `Valor da ordem (0 ${baseAsset}) é menor que o mínimo permitido`,
                        metadata: {
                            error: payload.action === 'buy'
                                ? `Valor mínimo não atingido em ${quoteAsset}`
                                : `Valor mínimo não atingido em ${baseAsset}`,
                            validationTime: timestamp,
                            payload
                        },
                        timestamp,
                        action: 'validate',
                        clientip: clientIp,
                        details: payload.action === 'buy'
                            ? `O valor da ordem em ${quoteAsset} deve ser maior que zero`
                            : `O valor da ordem em ${baseAsset} deve ser maior que zero`,
                        payload: payload,
                        status: 'error',
                        userId: null
                    };
                    logger.info('💾 Tentando salvar log de erro de validação:', errorLog);
                    await saveLog(errorLog);
                    res.status(400).json({
                        success: false,
                        message: errorLog.message,
                        error: errorLog.metadata.error,
                        details: errorLog.details
                    });
                    return;
                }
            }
            catch (validationError) {
                logger.error('❌ Erro durante a validação:', validationError);
                const errorLog = {
                    id: uuidv4(),
                    botId: null,
                    public_id: payload.public_id || 'unknown',
                    type: 'webhook_error',
                    message: 'Erro na validação do payload',
                    metadata: {
                        error: validationError instanceof Error ? validationError.message : 'Erro desconhecido',
                        validationTime: timestamp,
                        payload
                    },
                    timestamp,
                    action: 'validate',
                    clientip: clientIp,
                    details: 'Falha ao validar os dados recebidos',
                    payload: payload,
                    status: 'error',
                    userId: null
                };
                logger.info('💾 Tentando salvar log de erro de validação:', errorLog);
                await saveLog(errorLog);
                res.status(400).json({
                    success: false,
                    message: 'Erro na validação do payload',
                    error: validationError instanceof Error ? validationError.message : 'Erro desconhecido',
                    details: 'Falha ao validar os dados recebidos'
                });
                return;
            }
            const signal = payload;
            // Buscar o bot pelo public_id
            logger.info('🔍 Buscando bot:', signal.public_id);
            const { data: bot, error: botError } = await supabaseAdmin
                .from('Bots')
                .select('id, userId')
                .eq('public_id', signal.public_id)
                .single();
            if (botError) {
                logger.error('❌ Erro ao buscar bot:', botError);
                const errorLog = {
                    id: uuidv4(),
                    botId: signal.public_id, // Usar o public_id como botId temporário
                    public_id: signal.public_id,
                    type: 'webhook_error',
                    message: 'Erro ao buscar bot',
                    metadata: {
                        error: botError,
                        timestamp: new Date()
                    },
                    timestamp: new Date(),
                    action: 'validate',
                    clientip: clientIp,
                    details: 'Erro ao buscar bot no banco de dados',
                    payload: signal,
                    status: 'error',
                    userId: null
                };
                await saveLog(errorLog);
                throw botError;
            }
            if (!bot) {
                logger.error('❌ Bot não encontrado:', signal.public_id);
                const errorLog = {
                    id: uuidv4(),
                    botId: signal.public_id, // Usar o public_id como botId temporário
                    public_id: signal.public_id,
                    type: 'webhook_error',
                    message: 'Bot não encontrado',
                    metadata: {
                        error: 'Bot não encontrado',
                        timestamp: new Date()
                    },
                    timestamp: new Date(),
                    action: 'validate',
                    clientip: clientIp,
                    details: 'Bot não encontrado no banco de dados',
                    payload: signal,
                    status: 'error',
                    userId: null
                };
                await saveLog(errorLog);
                res.status(404).json({
                    error: 'Bot não encontrado'
                });
                return;
            }
            logger.info('✅ Bot encontrado:', bot);
            // Log do webhook recebido
            const webhookLog = {
                id: uuidv4(),
                botId: bot.id,
                public_id: signal.public_id,
                type: 'webhook_received',
                message: `Webhook recebido: ${signal.action.toUpperCase()} ${signal.ticker}`,
                metadata: {
                    signalTimestamp: signal.timestamp,
                    processedAt: timestamp,
                    webhookType: 'signal'
                },
                timestamp,
                action: signal.action,
                clientip: clientIp,
                details: `Sinal recebido: ${signal.action.toUpperCase()} ${signal.ticker} (${signal.order_size})`,
                payload: signal,
                status: 'received',
                userId: bot.userId
            };
            // Log do cálculo
            const calculationLog = {
                id: uuidv4(),
                botId: bot.id,
                public_id: signal.public_id,
                type: 'webhook_calculation',
                message: `Ordem calculada: ${signal.action.toLowerCase()} ${signal.ticker}`,
                metadata: {
                    signalTimestamp: signal.timestamp,
                    processedAt: timestamp,
                    webhookType: 'calculation',
                    calculationType: 'order_size'
                },
                timestamp,
                action: signal.action,
                clientip: clientIp,
                details: `Cálculo recebido: ${signal.action.toUpperCase()} ${signal.ticker} (${signal.order_size})`,
                payload: signal,
                status: 'pending',
                userId: bot.userId
            };
            logger.info('💾 Tentando salvar logs:', { webhookLog, calculationLog });
            const { data: logsData, error: logsError } = await supabaseAdmin
                .from('BotLog')
                .insert([webhookLog, calculationLog])
                .select();
            if (logsError) {
                logger.error('❌ Erro detalhado ao salvar logs:', {
                    error: logsError,
                    code: logsError.code,
                    details: logsError.details,
                    hint: logsError.hint,
                    message: logsError.message
                });
                throw logsError;
            }
            else {
                logger.info('✅ Logs salvos com sucesso:', logsData);
            }
            res.status(200).json({
                message: 'Sinal recebido com sucesso',
                signal_id: webhookLog.id,
                calculation_id: calculationLog.id,
                received_at: timestamp.toISOString()
            });
        }
        catch (error) {
            logger.error('❌ Erro ao processar webhook:', error);
            const systemErrorLog = {
                id: uuidv4(),
                botId: req.body?.public_id || 'system', // Usar public_id ou 'system' como botId temporário
                public_id: req.body?.public_id || 'system',
                type: 'webhook_error',
                message: 'Erro ao processar webhook',
                metadata: {
                    error: error instanceof Error ? error.message : 'Erro desconhecido',
                    stack: error instanceof Error ? error.stack : undefined,
                    payload: req.body
                },
                timestamp: new Date(),
                action: 'process',
                clientip: req.ip || 'unknown',
                details: error instanceof Error ? error.message : 'Erro interno ao processar webhook',
                payload: req.body,
                status: 'error',
                userId: null
            };
            try {
                logger.info('💾 Tentando salvar log de erro do sistema:', systemErrorLog);
                await saveLog(systemErrorLog);
            }
            catch (logError) {
                logger.error('❌ Erro ao tentar salvar log de erro:', logError);
            }
            res.status(500).json({
                error: 'Erro interno ao processar sinal',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
}
// Função auxiliar para salvar logs
async function saveLog(log) {
    try {
        const { data, error } = await supabaseAdmin
            .from('BotLog')
            .insert([log])
            .select()
            .single();
        if (error) {
            logger.error('❌ Erro ao salvar log:', error);
            throw error;
        }
        logger.info('✅ Log salvo com sucesso:', data);
        return data;
    }
    catch (error) {
        logger.error('❌ Erro ao salvar log:', error);
        throw error;
    }
}

import { supabaseAdmin } from '../supabase';
import { getExchange } from '../exchanges';
import { calculateOrderQuantity } from '../orderCalculator';
import { logger } from '../utils/logger';
import { addServerLog } from '../logUtils';
import { Bot, ExchangeConfig } from '../types';

interface PendingOrder {
  id: string;
  botId: string;
  action: string;
  payload: any;
  status: string;
  userId: string;
  metadata?: any;
  bot: {
    id: string;
    exchange: ExchangeConfig;
    tradingPair: string;
  };
}

export async function processOrderQueue() {
  try {
    // Buscar ordens pendentes no Supabase
    const { data: pendingOrders, error } = await supabaseAdmin
      .from('BotLog')
      .select(`
        *,
        bot:botId (
          id,
          exchange,
          tradingPair
        )
      `)
      .eq('type', 'webhook_received')
      .in('status', ['received', 'calculated'])
      .order('timestamp', { ascending: true })
      .limit(10);

    if (error) {
      throw new Error(`Erro ao buscar ordens pendentes: ${error.message}`);
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      return;
    }

    logger.info(`🔄 Processando ${pendingOrders.length} ordens pendentes`);

    for (const order of pendingOrders) {
      try {
        // Atualizar status para 'processing'
        await supabaseAdmin
          .from('BotLog')
          .update({ status: 'processing' })
          .eq('id', order.id);

        // Buscar bot
        const { data: bot, error: botError } = await supabaseAdmin
          .from('Bots')
          .select('*')
          .eq('id', order.botId)
          .single();

        if (botError || !bot) {
          throw new Error(botError ? botError.message : 'Bot não encontrado');
        }

        // Obter exchange configurada
        const exchange = getExchange(bot.exchange.name);
        if (!exchange) {
          throw new Error('Exchange não configurada');
        }

        let orderCalc;
        if (order.status === 'received') {
          // Obter saldos atuais
          const balances = await exchange.getBalances(bot.exchange.config.credentials);
          
          // Obter preço atual do ativo
          const currentPrice = await exchange.getCurrentPrice(order.payload.ticker);
          
          // Calcular quantidade da ordem
          orderCalc = await calculateOrderQuantity(
            balances,
            order.payload.order_size,
            order.payload.ticker,
            currentPrice,
            order.action.toLowerCase() as 'buy' | 'sell'
          );

          // Registrar resultado do cálculo
          await addServerLog({
            botId: order.botId,
            type: 'webhook_processed',
            action: order.action,
            message: `Ordem calculada: ${order.action} ${order.payload.ticker}`,
            details: `Cálculo concluído:
              Par: ${order.payload.ticker}
              Tamanho Original: ${order.payload.order_size}
              Quantidade Calculada: ${orderCalc.quantity}
              Valor Base: ${orderCalc.baseAmount}
              Valor Quote: ${orderCalc.quoteAmount}
              Preço: ${orderCalc.price}`,
            status: 'success',
            clientip: order.payload.clientIp || 'unknown',
            userId: order.userId,
            public_id: order.payload.public_id,
            payload: {
              ...order.payload,
              calculatedQuantity: orderCalc.quantity,
              currentPrice: orderCalc.price
            }
          });

          // Atualizar status da ordem original para 'calculated'
          await supabaseAdmin
            .from('BotLog')
            .update({ 
              status: 'calculated',
              metadata: {
                ...(order.metadata || {}),
                calculation: {
                  quantity: orderCalc.quantity,
                  baseAmount: orderCalc.baseAmount,
                  quoteAmount: orderCalc.quoteAmount,
                  price: orderCalc.price
                }
              }
            })
            .eq('id', order.id);

          logger.info('✅ Ordem calculada com sucesso', {
            orderId: order.id,
            quantity: orderCalc.quantity
          });
        } else {
          // Se a ordem já estiver calculada, usar os valores do metadata
          orderCalc = order.metadata.calculation;
        }

        // Obter timestamp do servidor da exchange
        const serverTime = await exchange.getServerTime();

        // Para compras, obter o saldo disponível em USDT
        let availableQuote = 0;
        if (order.action.toLowerCase() === 'buy') {
          const balances = await exchange.getBalances(bot.exchange.config.credentials);
          const quoteBalance = balances.find(b => b.asset === 'USDT');
          if (quoteBalance) {
            availableQuote = parseFloat(quoteBalance.free);
          }
        }

        // Executar a ordem
        const tradeResult = await exchange.executeTrade(bot.exchange.config.credentials, {
          symbol: order.payload.ticker,
          amount: order.action.toLowerCase() === 'buy' ? 
            String(availableQuote) :  // Para compra, usa todo o saldo em USDT
            String(orderCalc.quantity),      // Para venda, usa a quantidade do ativo
          type: order.action.toLowerCase() as 'buy' | 'sell',
          timestamp: serverTime
        });

        if (!tradeResult.success) {
          throw new Error(tradeResult.error || 'Erro ao executar ordem');
        }

        // Registrar sucesso da execução
        await addServerLog({
          botId: order.botId,
          type: 'webhook_executed',
          action: order.action,
          message: `Ordem executada: ${order.action} ${order.payload.ticker}`,
          details: `Execução concluída:
            Par: ${order.payload.ticker}
            Order ID: ${tradeResult.orderId}
            Quantidade: ${orderCalc.quantity}
            Valor: ${orderCalc.quoteAmount} USDT
            Preço: ${orderCalc.price}`,
          status: 'success',
          clientip: order.payload.clientIp || 'unknown',
          userId: order.userId,
          public_id: order.payload.public_id,
          payload: {
            ...order.payload,
            orderId: tradeResult.orderId
          }
        });

        // Atualizar status da ordem para 'executed'
        await supabaseAdmin
          .from('BotLog')
          .update({ 
            status: 'executed',
            metadata: {
              ...(order.metadata || {}),
              execution: {
                orderId: tradeResult.orderId,
                timestamp: new Date().toISOString()
              }
            }
          })
          .eq('id', order.id);

        logger.info('✅ Ordem executada com sucesso', {
          orderId: order.id,
          exchangeOrderId: tradeResult.orderId
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger.error('❌ Erro ao processar ordem', {
          orderId: order.id,
          error: errorMessage
        });

        // Registrar erro
        await addServerLog({
          botId: order.botId,
          type: 'webhook_error',
          action: order.action,
          message: errorMessage,
          details: errorMessage,
          status: 'error',
          clientip: order.payload.clientIp || 'unknown',
          userId: order.userId,
          public_id: order.payload.public_id,
          payload: order.payload
        });

        // Atualizar status da ordem original para 'error'
        await supabaseAdmin
          .from('BotLog')
          .update({ 
            status: 'error',
            metadata: {
              ...(order.metadata || {}),
              error: errorMessage
            }
          })
          .eq('id', order.id);
      }
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('❌ Erro ao processar fila de ordens:', errorMessage);
  }
}

// Iniciar processamento a cada 5 segundos
export function startOrderProcessor() {
  setInterval(processOrderQueue, 5000);
} 
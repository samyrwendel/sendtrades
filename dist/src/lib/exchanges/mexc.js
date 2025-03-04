import { generateSignature } from '../utils/crypto';
import { EXCHANGE_LOGOS } from './constants';
import { logger } from '../utils/logger';
import axios from 'axios';
import { calculateOrderQuantity } from '../orderCalculator';
const MEXC_API_URL = 'https://api.mexc.com/api/v3';
export const mexcExchange = {
    name: 'MEXC',
    logo: EXCHANGE_LOGOS.MEXC,
    async getServerTime() {
        try {
            const response = await axios.get(`${MEXC_API_URL}/time`);
            const serverTime = response.data.serverTime;
            logger.info('Timestamp do servidor obtido', {
                serverTime,
                currentTime: Date.now(),
                diff: Date.now() - serverTime,
                serverTimeISO: new Date(serverTime).toISOString()
            });
            return serverTime;
        }
        catch (error) {
            const timestamp = Date.now();
            logger.error('Erro ao obter timestamp do servidor, usando timestamp local:', {
                timestamp,
                timestampISO: new Date(timestamp).toISOString(),
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
            return timestamp;
        }
    },
    async getCurrentPrice(symbol) {
        try {
            logger.info('Obtendo preço atual', { symbol });
            const response = await axios.get(`${MEXC_API_URL}/ticker/price?symbol=${symbol}`);
            if (!response.data || !response.data.price) {
                throw new Error('Formato de resposta inválido');
            }
            const price = response.data.price;
            logger.info('Preço obtido com sucesso', {
                symbol,
                price,
                timestamp: new Date().toISOString()
            });
            return price;
        }
        catch (error) {
            logger.error('Erro ao obter preço', {
                symbol,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    },
    async validateCredentials(credentials) {
        try {
            const balances = await this.getBalances(credentials);
            return {
                isValid: true,
                balances
            };
        }
        catch (error) {
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Failed to validate credentials'
            };
        }
    },
    async getBalances(credentials) {
        try {
            logger.info('Iniciando obtenção de saldos da MEXC', {
                timestamp: new Date().toISOString(),
                apiKey: credentials.apiKey.substring(0, 4) + '...',
                botId: credentials.botId
            });
            // Obter timestamp do servidor
            const timestamp = await this.getServerTime();
            const recvWindow = '5000';
            // Montar query string na ordem correta
            const queryString = `recvWindow=${recvWindow}&timestamp=${timestamp}`;
            logger.info('Query string gerada', { queryString });
            // Gerar assinatura
            const signature = await generateSignature(queryString, credentials.secretKey);
            logger.info('Assinatura gerada', {
                signatureLength: signature.length,
                signaturePreview: signature.substring(0, 10) + '...'
            });
            // Fazer requisição
            const url = `${MEXC_API_URL}/account?${queryString}&signature=${signature}`;
            logger.info('Enviando requisição para MEXC', {
                url: url.replace(credentials.apiKey, '***'),
                method: 'GET'
            });
            const response = await axios.get(url, {
                headers: {
                    'X-MEXC-APIKEY': credentials.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            logger.info('Resposta recebida da MEXC', {
                status: response.status,
                statusText: response.statusText,
                data: response.data
            });
            // Validar resposta
            if (!response.data || !Array.isArray(response.data.balances)) {
                throw new Error(`Formato de resposta inválido: ${JSON.stringify(response.data)}`);
            }
            // Filtrar e mapear saldos
            const balances = response.data.balances
                .filter((balance) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
                .map((balance) => ({
                asset: balance.asset,
                free: balance.free,
                locked: balance.locked
            }));
            logger.info('Saldos processados com sucesso', {
                totalBalances: balances.length,
                balances: balances.map((b) => ({
                    asset: b.asset,
                    free: parseFloat(b.free),
                    locked: parseFloat(b.locked)
                })),
                timestamp: new Date().toISOString()
            });
            return balances;
        }
        catch (error) {
            logger.error('Erro ao obter saldos da MEXC', {
                error: error instanceof Error ? error.message : 'Erro desconhecido',
                details: axios.isAxiosError(error) ? {
                    status: error.response?.status,
                    data: error.response?.data,
                    headers: error.response?.headers
                } : undefined,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    },
    async executeTrade(credentials, tradeParams) {
        try {
            logger.info('Iniciando execução de trade na MEXC', {
                symbol: tradeParams.symbol,
                type: tradeParams.type,
                amount: tradeParams.amount,
                botId: credentials.botId,
                timestamp: tradeParams.timestamp
                    ? new Date(tradeParams.timestamp).toISOString()
                    : new Date().toISOString()
            });
            // Obter preço atual
            const currentPrice = await this.getCurrentPrice(tradeParams.symbol);
            // Obter saldos
            const balances = await this.getBalances(credentials);
            // Calcular quantidade da ordem
            const orderCalc = await calculateOrderQuantity(balances, tradeParams.amount, tradeParams.symbol, currentPrice, tradeParams.type.toLowerCase());
            // Verificar se há avisos que impedem a execução
            if (orderCalc.metadata?.warnings?.some(w => w.type === 'FATAL')) {
                throw new Error(orderCalc.metadata.warnings[0].message);
            }
            // Usar o timestamp fornecido ou obter do servidor
            const timestamp = tradeParams.timestamp || await this.getServerTime();
            logger.info('Timestamp para execução', {
                timestamp,
                isFromWebhook: !!tradeParams.timestamp,
                iso: new Date(timestamp).toISOString()
            });
            // Montar parâmetros da ordem
            const orderParams = {
                symbol: tradeParams.symbol,
                side: tradeParams.type.toUpperCase(),
                type: 'MARKET',
                timestamp: timestamp.toString(),
                recvWindow: '60000' // 60 segundos para compensar possíveis delays
            };
            // Para ordens de compra, usamos quoteOrderQty (valor em USDT)
            // Para ordens de venda, usamos quantity (quantidade do ativo)
            if (tradeParams.type.toUpperCase() === 'BUY') {
                // Ajustar valor considerando taxas e limites
                const quoteAmount = Number(tradeParams.amount);
                // Reduzir 1% para garantir que há saldo suficiente para taxas
                const adjustedAmount = quoteAmount * 0.99;
                // Arredondar para 4 casas decimais (padrão USDT)
                const finalAmount = Math.floor(adjustedAmount * 10000) / 10000;
                if (finalAmount <= 0) {
                    throw new Error('Valor da ordem deve ser maior que zero');
                }
                orderParams.quoteOrderQty = finalAmount.toFixed(4);
                logger.info('Valor da ordem de compra', {
                    symbol: tradeParams.symbol,
                    precision: 4,
                    originalValue: quoteAmount,
                    adjustedValue: finalAmount,
                    orderValueUSDT: finalAmount.toFixed(4)
                });
            }
            else {
                // Ajustar precisão baseado no par
                // XRPUSDT tem baseAssetPrecision = 2
                const precision = tradeParams.symbol === 'XRPUSDT' ? 2 : 8;
                const quantity = Number(orderCalc.quantity);
                if (quantity <= 0) {
                    throw new Error('Quantidade da ordem deve ser maior que zero');
                }
                orderParams.quantity = quantity.toFixed(precision);
                logger.info('Quantidade da ordem ajustada', {
                    symbol: tradeParams.symbol,
                    precision,
                    originalQuantity: orderCalc.quantity,
                    adjustedQuantity: orderParams.quantity,
                    orderValueUSDT: (quantity * Number(currentPrice)).toFixed(2)
                });
            }
            // Ordenar parâmetros em ordem alfabética para a assinatura
            const orderedParams = Object.keys(orderParams)
                .sort()
                .reduce((obj, key) => {
                obj[key] = orderParams[key];
                return obj;
            }, {});
            // Criar query string
            const queryString = Object.entries(orderedParams)
                .map(([key, value]) => `${key}=${value}`)
                .join('&');
            logger.info('Parâmetros da ordem', {
                params: orderedParams,
                queryString
            });
            // Gerar assinatura
            const signature = await generateSignature(queryString, credentials.secretKey);
            logger.info('Assinatura gerada', {
                signatureLength: signature.length,
                signaturePreview: signature.substring(0, 10) + '...'
            });
            // Fazer requisição para criar a ordem
            const finalUrl = `${MEXC_API_URL}/order?${queryString}&signature=${signature}`;
            logger.info('Enviando ordem para MEXC', {
                url: finalUrl.replace(credentials.apiKey, '***'),
                method: 'POST',
                params: orderedParams
            });
            const response = await axios({
                method: 'POST',
                url: finalUrl,
                headers: {
                    'X-MEXC-APIKEY': credentials.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            logger.info('Resposta recebida da MEXC', {
                status: response.status,
                statusText: response.statusText,
                data: response.data
            });
            // Validar resposta
            if (response.status === 200 && response.data.orderId) {
                logger.info('Ordem criada com sucesso', {
                    orderId: response.data.orderId,
                    symbol: tradeParams.symbol,
                    side: tradeParams.type,
                    executedQty: response.data.executedQty,
                    cummulativeQuoteQty: response.data.cummulativeQuoteQty
                });
                return {
                    success: true,
                    orderId: response.data.orderId.toString()
                };
            }
            throw new Error(`Erro ao criar ordem: ${JSON.stringify(response.data)}`);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                logger.error('Erro na requisição à MEXC', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    headers: error.response?.headers,
                    timestamp: new Date().toISOString()
                });
                // Retornar mensagem de erro específica da MEXC se disponível
                if (error.response?.data?.msg) {
                    return {
                        success: false,
                        error: `Erro MEXC: ${error.response.data.msg}. Detalhes: ${JSON.stringify({
                            symbol: tradeParams.symbol,
                            type: tradeParams.type,
                            amount: tradeParams.amount,
                            timestamp: new Date().toISOString()
                        })}`
                    };
                }
            }
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            };
        }
    },
};

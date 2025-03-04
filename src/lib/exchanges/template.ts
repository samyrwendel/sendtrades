import { ExchangeAPI, ExchangeCredentials, Balance, TradeParams } from './types';
import { generateSignature } from '../utils/crypto';
import { EXCHANGE_LOGOS } from './constants';
import { logger } from '../utils/logger';
import axios from 'axios';
import { calculateOrderQuantity } from '../orderCalculator';

// TODO: Substituir pela URL base da API da exchange desejada
const API_URL = 'https://api.exchange.com/api/v1';

// TODO: Substituir pelo nome da exchange e seu logo
export const exchangeTemplate: ExchangeAPI = {
  name: 'EXCHANGE_NAME',
  logo: EXCHANGE_LOGOS.EXCHANGE_NAME,

  async getServerTime(): Promise<number> {
    try {
      // TODO: Adaptar endpoint para obter timestamp do servidor da exchange
      const response = await axios.get(`${API_URL}/time`);
      const serverTime = response.data.serverTime; // Adaptar campo conforme resposta da API
      
      logger.info('Timestamp do servidor obtido', {
        serverTime,
        currentTime: Date.now(),
        diff: Date.now() - serverTime,
        serverTimeISO: new Date(serverTime).toISOString()
      });
      
      return serverTime;
    } catch (error) {
      const timestamp = Date.now();
      logger.error('Erro ao obter timestamp do servidor, usando timestamp local:', {
        timestamp,
        timestampISO: new Date(timestamp).toISOString(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return timestamp;
    }
  },

  async getCurrentPrice(symbol: string): Promise<string> {
    try {
      logger.info('Obtendo preço atual', { symbol });
      
      // TODO: Adaptar endpoint e parâmetros para obter preço atual do par
      const response = await axios.get(`${API_URL}/ticker/price?symbol=${symbol}`);
      
      // TODO: Adaptar validação conforme formato da resposta da exchange
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
    } catch (error) {
      logger.error('Erro ao obter preço', {
        symbol,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  async validateCredentials(credentials: ExchangeCredentials) {
    try {
      const balances = await this.getBalances(credentials);
      return {
        isValid: true,
        balances
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Failed to validate credentials'
      };
    }
  },

  async getBalances(credentials: ExchangeCredentials): Promise<Balance[]> {
    try {
      logger.info('Iniciando obtenção de saldos', { 
        timestamp: new Date().toISOString(),
        apiKey: credentials.apiKey.substring(0, 4) + '...',
        botId: credentials.botId
      });
      
      const timestamp = await this.getServerTime();
      
      // TODO: Adaptar parâmetros de autenticação conforme exigido pela exchange
      const recvWindow = '5000';
      const queryString = `recvWindow=${recvWindow}&timestamp=${timestamp}`;
      
      logger.info('Query string gerada', { queryString });
      
      // TODO: Adaptar geração de assinatura conforme exigido pela exchange
      const signature = await generateSignature(queryString, credentials.secretKey);
      
      logger.info('Assinatura gerada', { 
        signatureLength: signature.length,
        signaturePreview: signature.substring(0, 10) + '...'
      });
      
      // TODO: Adaptar URL e headers conforme exigido pela exchange
      const url = `${API_URL}/account?${queryString}&signature=${signature}`;
      
      logger.info('Enviando requisição', {
        url: url.replace(credentials.apiKey, '***'),
        method: 'GET'
      });

      const response = await axios.get(url, {
        headers: {
          'API-KEY': credentials.apiKey,
          'Content-Type': 'application/json'
        }
      });

      logger.info('Resposta recebida', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      // TODO: Adaptar validação e mapeamento conforme formato da resposta da exchange
      if (!response.data || !Array.isArray(response.data.balances)) {
        throw new Error(`Formato de resposta inválido: ${JSON.stringify(response.data)}`);
      }

      const balances = response.data.balances
        .filter((balance: any) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
        .map((balance: any) => ({
          asset: balance.asset,
          free: balance.free,
          locked: balance.locked
        }));

      logger.info('Saldos processados com sucesso', { 
        totalBalances: balances.length,
        balances: balances.map((b: Balance) => ({
          asset: b.asset,
          free: parseFloat(b.free),
          locked: parseFloat(b.locked)
        })),
        timestamp: new Date().toISOString()
      });

      return balances;

    } catch (error) {
      logger.error('Erro ao obter saldos', {
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

  async executeTrade(credentials: ExchangeCredentials, tradeParams: TradeParams) {
    try {
      logger.info('Iniciando execução de trade', {
        symbol: tradeParams.symbol,
        type: tradeParams.type,
        amount: tradeParams.amount,
        botId: credentials.botId,
        timestamp: tradeParams.timestamp 
          ? new Date(tradeParams.timestamp).toISOString()
          : new Date().toISOString()
      });

      const currentPrice = await this.getCurrentPrice(tradeParams.symbol);
      const balances = await this.getBalances(credentials);
      
      const orderCalc = await calculateOrderQuantity(
        balances,
        tradeParams.amount,
        tradeParams.symbol,
        currentPrice,
        tradeParams.type.toLowerCase() as 'buy' | 'sell'
      );

      if (orderCalc.metadata?.warnings?.some(w => w.type === 'FATAL')) {
        throw new Error(orderCalc.metadata.warnings[0].message);
      }

      const timestamp = tradeParams.timestamp || await this.getServerTime();
      
      logger.info('Timestamp para execução', {
        timestamp,
        isFromWebhook: !!tradeParams.timestamp,
        iso: new Date(timestamp).toISOString()
      });
      
      // TODO: Adaptar parâmetros da ordem conforme exigido pela exchange
      const orderParams: Record<string, string> = {
        symbol: tradeParams.symbol,
        side: tradeParams.type.toUpperCase(),
        type: 'MARKET',
        timestamp: timestamp.toString(),
        recvWindow: '60000'
      };

      // TODO: Adaptar lógica de quantidade/valor conforme exigido pela exchange
      if (tradeParams.type.toUpperCase() === 'BUY') {
        const quoteAmount = Number(tradeParams.amount);
        const adjustedAmount = quoteAmount * 0.99; // Redução para taxas
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
      } else {
        // TODO: Adaptar precisão conforme regras da exchange
        const precision = tradeParams.symbol === 'XRPUSDT' ? 2 : 8;
        const quantity = Number(orderCalc.quantity);
        
        if (quantity <= 0) {
          throw new Error('Quantidade da ordem deve ser maior que zero');
        }
        
        orderParams.quantity = quantity.toFixed(precision);
        
        logger.info('Quantidade da ordem de venda', {
          symbol: tradeParams.symbol,
          precision,
          quantity: orderParams.quantity
        });
      }

      // TODO: Adaptar geração de assinatura conforme exigido pela exchange
      const queryString = Object.entries(orderParams)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
      
      const signature = await generateSignature(queryString, credentials.secretKey);
      
      // TODO: Adaptar URL e headers conforme exigido pela exchange
      const url = `${API_URL}/order?${queryString}&signature=${signature}`;
      
      logger.info('Enviando ordem', {
        url: url.replace(credentials.apiKey, '***'),
        method: 'POST',
        params: orderParams
      });

      const response = await axios.post(url, null, {
        headers: {
          'API-KEY': credentials.apiKey,
          'Content-Type': 'application/json'
        }
      });

      logger.info('Ordem executada com sucesso', {
        status: response.status,
        data: response.data,
        timestamp: new Date().toISOString()
      });

      // TODO: Adaptar retorno conforme formato da resposta da exchange
      return {
        success: true,
        orderId: response.data.orderId,
        executedQty: response.data.executedQty,
        price: response.data.price
      };

    } catch (error) {
      logger.error('Erro ao executar ordem', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: axios.isAxiosError(error) ? {
          status: error.response?.status,
          data: error.response?.data
        } : undefined,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }
}; 
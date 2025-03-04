import axios from 'axios';
import crypto from 'crypto';
import { ExchangeAPI, ExchangeCredentials, Balance, TradeParams } from './types';
import { BINANCE_CONFIG } from './constants';

class BinanceExchange implements ExchangeAPI {
  name = 'BINANCE';
  logo = 'binance';

  private generateSignature(queryString: string, secretKey: string): string {
    return crypto
      .createHmac('sha256', secretKey)
      .update(queryString)
      .digest('hex');
  }

  private async makeSignedRequest(
    endpoint: string,
    credentials: ExchangeCredentials,
    params: Record<string, any> = {}
  ) {
    const timestamp = Date.now();
    const recvWindow = BINANCE_CONFIG.recvWindow;

    const queryParams = new URLSearchParams({
      ...params,
      timestamp: timestamp.toString(),
      recvWindow: recvWindow.toString(),
    }).toString();

    const signature = this.generateSignature(queryParams, credentials.secretKey);
    const url = `${BINANCE_CONFIG.baseUrl}${endpoint}?${queryParams}&signature=${signature}`;

    try {
      const response = await axios.get(url, {
        headers: {
          'X-MBX-APIKEY': credentials.apiKey,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro na requisição Binance:', error.response?.data || error.message);
      throw error;
    }
  }

  async validateCredentials(credentials: ExchangeCredentials) {
    try {
      const accountInfo = await this.makeSignedRequest(
        BINANCE_CONFIG.endpoints.account,
        credentials
      );

      const hasSpotPermission = accountInfo.permissions?.includes('SPOT');
      if (!hasSpotPermission) {
        return {
          isValid: false,
          error: 'A API key não tem permissão para trading spot',
        };
      }

      return {
        isValid: true,
        balances: accountInfo.balances,
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: error.response?.data?.msg || 'Erro ao validar credenciais',
      };
    }
  }

  async getBalances(credentials: ExchangeCredentials): Promise<Balance[]> {
    try {
      const accountInfo = await this.makeSignedRequest(
        BINANCE_CONFIG.endpoints.account,
        credentials
      );

      return accountInfo.balances
        .filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
        .map((b: any) => ({
          asset: b.asset,
          free: b.free,
          locked: b.locked,
        }));
    } catch (error: any) {
      console.error('Erro ao buscar saldos:', error);
      throw new Error(error.response?.data?.msg || 'Erro ao buscar saldos');
    }
  }

  async getCurrentPrice(symbol: string): Promise<string> {
    try {
      const response = await axios.get(
        `${BINANCE_CONFIG.baseUrl}${BINANCE_CONFIG.endpoints.ticker}?symbol=${symbol}`
      );
      return response.data.price;
    } catch (error: any) {
      console.error('Erro ao buscar preço:', error);
      throw new Error(error.response?.data?.msg || 'Erro ao buscar preço');
    }
  }

  async getServerTime(): Promise<number> {
    try {
      const response = await axios.get(
        `${BINANCE_CONFIG.baseUrl}${BINANCE_CONFIG.endpoints.time}`
      );
      return response.data.serverTime;
    } catch (error: any) {
      console.error('Erro ao buscar tempo do servidor:', error);
      throw new Error(error.response?.data?.msg || 'Erro ao buscar tempo do servidor');
    }
  }

  async executeTrade(
    credentials: ExchangeCredentials,
    params: TradeParams
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      const orderParams = {
        symbol: params.symbol,
        side: params.type.toUpperCase(),
        type: 'MARKET',
        quantity: params.amount,
      };

      const response = await this.makeSignedRequest(
        BINANCE_CONFIG.endpoints.order,
        credentials,
        orderParams
      );

      return {
        success: true,
        orderId: response.orderId.toString(),
      };
    } catch (error: any) {
      console.error('Erro ao executar trade:', error);
      return {
        success: false,
        error: error.response?.data?.msg || 'Erro ao executar trade',
      };
    }
  }
}

export const binanceExchange = new BinanceExchange();
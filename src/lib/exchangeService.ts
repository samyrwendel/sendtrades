import { ExchangeAPI, ExchangeCredentials, Balance, TradeParams } from './exchanges/types';
import { getExchange } from './exchanges';

export class ExchangeService {
  private exchange: ExchangeAPI;

  constructor(exchangeName: string) {
    const exchange = getExchange(exchangeName);
    if (!exchange) {
      throw new Error(`Exchange ${exchangeName} não encontrada`);
    }
    this.exchange = exchange;
  }

  async validateCredentials(credentials: ExchangeCredentials) {
    return this.exchange.validateCredentials(credentials);
  }

  async getBalances(credentials: ExchangeCredentials) {
    return this.exchange.getBalances(credentials);
  }

  async executeTrade(credentials: ExchangeCredentials, params: TradeParams) {
    return this.exchange.executeTrade(credentials, params);
  }

  getName() {
    return this.exchange.name;
  }

  getLogo() {
    return this.exchange.logo;
  }
} 
export interface ExchangeCredentials {
  apiKey: string;
  secretKey: string;
}

export interface Balance {
  asset: string;
  free: string;
  locked: string;
}

export interface TradeParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  quantity: string;
  price?: string;
}

export interface ExchangeAPI {
  name: string;
  logo: string;
  getServerTime(): Promise<number>;
  getCurrentPrice(symbol: string): Promise<string>;
  validateCredentials(credentials: ExchangeCredentials): Promise<void>;
  getBalances(credentials: ExchangeCredentials): Promise<Balance[]>;
  executeTrade(credentials: ExchangeCredentials, tradeParams: TradeParams): Promise<any>;
} 
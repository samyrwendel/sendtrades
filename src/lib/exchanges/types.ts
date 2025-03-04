export interface Balance {
  asset: string;
  free: string;
  locked: string;
}

export interface ExchangeCredentials {
  apiKey: string;
  secretKey: string;
  botId: string;
  exchange: string;
}

export interface BinanceCredentials extends ExchangeCredentials {
  exchange: 'BINANCE';
  apiKey: string;
  secretKey: string;
  enableSpotAndMarginTrading?: boolean;
}

export interface TradeParams {
  symbol: string;
  amount: string;
  type: 'buy' | 'sell';
  timestamp?: number;
}

export interface ExchangeAPI {
  name: string;
  logo: string;
  validateCredentials: (credentials: ExchangeCredentials) => Promise<{
    isValid: boolean;
    balances?: Balance[];
    error?: string;
  }>;
  getBalances: (credentials: ExchangeCredentials) => Promise<Balance[]>;
  getCurrentPrice: (symbol: string) => Promise<string>;
  getServerTime: () => Promise<number>;
  executeTrade: (credentials: ExchangeCredentials, params: TradeParams) => Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
  }>;
}
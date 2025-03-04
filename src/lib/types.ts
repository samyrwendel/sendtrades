import { Database } from './database.types'

export type Tables = Database['public']['Tables']

export interface User {
  id: string
  email: string
  password: string
  name: string | null
  plan: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Bot {
  id: string;
  public_id: string;
  name: string;
  enabled: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tradingPair: string;
  exchange: ExchangeConfig;
  webhook: WebhookConfig;
  settings: BotSettings;
  statistics: BotStatistics;
  config?: {
    owner: string;
    [key: string]: any;
  };
}

export interface BotLog {
  id: string;
  botId?: string;
  userId?: string;
  public_id?: string;
  type: string;
  action: string;
  message: string;
  details?: string;
  metadata?: any;
  payload?: any;
  timestamp: Date;
  status: string;
  clientip?: string;
  bot?: Bot;
  severity?: number;
}

export interface Order {
  id: string
  botId: string
  symbol: string
  side: string
  type: string
  status: string
  price: number
  quantity: number
  quoteQuantity: number
  commission: number
  commissionAsset: string
  createdAt: Date
  updatedAt: Date
  data: any | null
}

export interface ApiKey {
  id: string
  userId: string
  exchange: string
  name: string
  key: string
  secret: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MexcSymbolFilter {
  filterType: string;
  minPrice?: string;
  maxPrice?: string;
  tickSize?: string;
  minQty?: string;
  maxQty?: string;
  stepSize?: string;
  minNotional?: string;
  maxNotional?: string;
  limit?: {
    min: string;
    max: string;
  };
}

export interface MexcSymbol {
  symbol: string;
  status: 'TRADING' | 'BREAK' | 'HALT' | '1' | 'ENABLED' | 1;
  baseAsset: string;
  quoteAsset: string;
  baseAssetPrecision: number;
  quoteAssetPrecision: number;
  orderTypes: string[];
  filters: MexcSymbolFilter[];
  permissions: string[];
  quoteAmountPrecision?: string;
  baseSizePrecision?: string;
  quotePrecision?: string;
  underlying?: string;
  underlyingType?: string;
  settlePlan?: string;
  triggerProtect?: string;
  quoteAssetId?: string;
  baseAssetId?: string;
  isSpotTradingAllowed?: boolean;
  isMarginTradingAllowed?: boolean;
}

export interface MexcExchangeInfo {
  timezone: string;
  serverTime: number;
  symbols: MexcSymbol[];
}

export interface MexcBalance {
  asset: string;
  free: string;
  locked: string;
}

export interface MexcAccountResponse {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: string;
  balances: MexcBalance[];
  permissions: string[];
}

export type SupportedExchange = 'MEXC' | 'BINANCE';

export interface ExchangeConfig {
  name: SupportedExchange;
  config: {
    credentials: {
      apiKey: string;
      secretKey: string;
    };
    testnet: boolean;
  };
  tradingInfo?: {
    baseAsset: string;
    quoteAsset: string;
    minOrderSize: string;
    maxOrderSize: string;
    precision: number;
    status: string;
  };
}

export interface WebhookConfig {
  enabled: boolean;
  url: string;
  secretKey: string;
  allowedIPs: string[];
  maxOrdersPerMinute: number;
}

export interface WebhookFormData {
  enabled?: boolean;
  secretKey: string;
  allowedIPs: string;
  maxOrdersPerMinute: number;
}

export interface WebhookPayload {
  public_id?: string;
  action: 'buy' | 'sell';
  ticker: string;
  order_size: string;
  position_size: string;
  schema: string;
  timestamp: Date;
}

export interface BotSettings {
  maxOrderSize: string;
  minOrderSize: string;
  maxDailyOrders: number;
  tradingEnabled: boolean;
  notifications: {
    email: boolean;
    telegram: boolean;
  };
  [key: string]: any;
}

export interface BotStatistics {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  lastTradeAt: Date | null;
  profitLoss: string;
  winRate: string;
  [key: string]: any;
}

export interface OrderLog {
  id: string;
  botId: string;
  botName: string;
  orderId?: string;
  symbol: string;
  amount: string;
  type: 'BUY' | 'SELL';
  price?: string;
  action: string;
  details: string;
  timestamp: Date;
  status: 'pending' | 'executed' | 'failed' | 'cancelled';
}

export interface BaseExchangeCredentials {
  exchange: string;
}

export interface MexcCredentials extends BaseExchangeCredentials {
  exchange: 'MEXC';
  apiKey: string;
  secretKey: string;
}

export interface KuCoinCredentials extends BaseExchangeCredentials {
  exchange: 'KUCOIN';
  apiKey: string;
  secretKey: string;
  passphrase: string;
}

export interface BitgetCredentials extends BaseExchangeCredentials {
  exchange: 'BITGET';
  apiKey: string;
  secretKey: string;
  passphrase: string;
}

export interface CoinbaseCredentials extends BaseExchangeCredentials {
  exchange: 'COINBASE';
  apiKeyName: string;
  privateKey: string;
}

export interface BybitCredentials extends BaseExchangeCredentials {
  exchange: 'BYBIT';
  apiKey: string;
  secretKey: string;
}

export interface KrakenCredentials extends BaseExchangeCredentials {
  exchange: 'KRAKEN';
  apiKey: string;
  secretKey: string;
}

export type ExchangeCredentials = 
  | MexcCredentials 
  | KuCoinCredentials 
  | BitgetCredentials 
  | CoinbaseCredentials 
  | BybitCredentials 
  | KrakenCredentials;

export type PlanType = 'free' | 'pro' | 'enterprise' | 'unlimited' | 'admin';

export interface Translation {
  errors: {
    failedToLoadPairs: string;
    tradingPairsError: string;
    fillAllCredentials: string;
    unsupportedExchange: string;
    invalidCredentials: string;
    generalError: string;
    failedToLoadBots: string;
    failedToDeleteBot: string;
    sessionExpired: string;
  };
  success: {
    botCreated: string;
    botDeleted: string;
    botUpdated: string;
    botActivated: string;
    botPaused: string;
  };
  common: {
    loading: string;
  };
  bots: {
    active: string;
    paused: string;
    createBot: string;
    noActiveBots: string;
    noPausedBots: string;
    botId: string;
    tradingPair: string;
    exchange: string;
    webhookEnabled: string;
    maxOrdersPerMinute: string;
    statistics: string;
    totalTrades: string;
    winRate: string;
    profitLoss: string;
    createdAt: string;
    updatedAt: string;
  };
  dashboard: {
    myBots: string;
  };
  trading: {
    base: string;
    quote: string;
    min: string;
    max: string;
  };
}

export interface BotParams {
  id: string;
}

export interface CreateBotRequest {
  name: string;
  tradingPair: string;
  exchange: ExchangeConfig;
  webhook: WebhookConfig;
  settings: BotSettings;
  enabled?: boolean;
}

export interface UpdateBotRequest {
  name?: string;
  tradingPair?: string;
  exchange?: ExchangeConfig;
  webhook?: WebhookConfig;
  settings?: BotSettings;
  enabled?: boolean;
}

export type LogAction = 'buy' | 'sell' | 'validate' | 'error' | 'system';

export interface LogEntry {
  botId: string;
  type: string;
  action: LogAction;
  message: string;
  details: string;
  status: 'success' | 'error';
  clientIp: string;
  userId: string;
  payload: any;
}

export interface ExchangeStatus {
  implemented: boolean;
  name: string;
  priority: boolean;
  inProgress?: boolean;
  requiresSpotPermission?: boolean;
} 
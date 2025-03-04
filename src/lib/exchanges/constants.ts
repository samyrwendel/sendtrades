import { ExchangeStatus } from '../types';

// Caminho base para os logos locais
export const BASE_LOGO_PATH = '/assets/exchanges';

// Definição dos caminhos dos logos para todas as exchanges suportadas e futuras
export const EXCHANGE_LOGOS = {
  MEXC: `${BASE_LOGO_PATH}/mexc.png`,
  BINANCE: `${BASE_LOGO_PATH}/binance.png`,
  KUCOIN: `${BASE_LOGO_PATH}/kucoin.png`,
  BYBIT: `${BASE_LOGO_PATH}/bybit.png`,
  COINBASE: `${BASE_LOGO_PATH}/coinbase.png`,
  KRAKEN: `${BASE_LOGO_PATH}/kraken.png`,
} as const;

// Status de implementação das exchanges
export const EXCHANGE_STATUS: Record<string, ExchangeStatus> = {
  MEXC: {
    implemented: true,
    name: 'MEXC',
    priority: true,
  },
  BINANCE: {
    implemented: true,
    name: 'Binance',
    priority: true,
    requiresSpotPermission: true,
  },
  KUCOIN: {
    implemented: false,
    name: 'KuCoin',
    priority: false,
  },
  BYBIT: {
    implemented: false,
    name: 'Bybit',
    priority: false,
  },
  COINBASE: {
    implemented: false,
    name: 'Coinbase',
    priority: false,
  },
  KRAKEN: {
    implemented: false,
    name: 'Kraken',
    priority: false,
  },
} as const;

// Configurações específicas da Binance
export const BINANCE_CONFIG = {
  baseUrl: 'https://api.binance.com',
  endpoints: {
    time: '/api/v3/time',
    account: '/api/v3/account',
    exchangeInfo: '/api/v3/exchangeInfo',
    ticker: '/api/v3/ticker/price',
    order: '/api/v3/order',
  },
  recvWindow: 5000,
} as const; 
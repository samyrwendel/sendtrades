import { ExchangeAPI } from './types';
import { mexcExchange } from './mexc';
import { binanceExchange } from './binance';
// import { exchangeTemplate } from './template';

export const exchanges: Record<string, ExchangeAPI> = {
  mexc: mexcExchange,
  binance: binanceExchange,
  // template: exchangeTemplate, // Descomente para usar o template
};

export const getExchange = (name: string): ExchangeAPI | undefined => {
  return exchanges[name.toLowerCase()];
};

export * from './types';
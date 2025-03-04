import { mexcExchange } from './mexc';
import { binanceExchange } from './binance';
export const exchanges = {
    mexc: mexcExchange,
    binance: binanceExchange,
};
export const getExchange = (name) => {
    return exchanges[name.toLowerCase()];
};
export * from './types';

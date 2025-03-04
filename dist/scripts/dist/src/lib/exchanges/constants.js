// Caminho base para os logos locais
const BASE_LOGO_PATH = '/assets/exchanges';
// Definição dos caminhos dos logos para todas as exchanges suportadas e futuras
export const EXCHANGE_LOGOS = {
    MEXC: `${BASE_LOGO_PATH}/mexc.png`,
    BINANCE: `${BASE_LOGO_PATH}/binance.png`,
    KUCOIN: `${BASE_LOGO_PATH}/kucoin.png`,
    BYBIT: `${BASE_LOGO_PATH}/bybit.png`,
    COINBASE: `${BASE_LOGO_PATH}/coinbase.png`,
    KRAKEN: `${BASE_LOGO_PATH}/kraken.png`,
};
// Status de implementação das exchanges
export const EXCHANGE_STATUS = {
    MEXC: {
        implemented: true,
        name: 'MEXC',
        priority: true,
    },
    BINANCE: {
        implemented: false,
        name: 'Binance',
        priority: false,
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
};

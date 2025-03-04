// Definindo os tipos
export type TokenSymbol = 'USDT' | 'USDC' | 'BUSD' | 'BTC' | 'ETH' | 'BNB' | 'XRP' | 'PI' | 'AIXBT';
export type TokenIconUrls = Record<TokenSymbol, string>;

// URLs oficiais dos ícones dos tokens do cryptologos.cc e coinmarketcap
export const TOKEN_ICONS: TokenIconUrls = {
  // Stablecoins
  USDT: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  USDC: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  BUSD: 'https://cryptologos.cc/logos/binance-usd-busd-logo.png',

  // Principais criptomoedas
  BTC: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  ETH: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  BNB: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  XRP: 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
  
  // Pi Network do CoinMarketCap
  PI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/35697.png',

  // AIXBT
  AIXBT: '/assets/tokens/aixbt.png'
} as const;

// Exporta os caminhos locais dos ícones
export const LOCAL_TOKEN_ICONS: TokenIconUrls = {
  USDT: '/assets/tokens/usdt.png',
  USDC: '/assets/tokens/usdc.png',
  BUSD: '/assets/tokens/busd.png',
  BTC: '/assets/tokens/btc.png',
  ETH: '/assets/tokens/eth.png',
  BNB: '/assets/tokens/bnb.png',
  XRP: '/assets/tokens/xrp.png',
  PI: '/assets/tokens/pi.png',
  AIXBT: '/assets/tokens/aixbt.png'
} as const; 
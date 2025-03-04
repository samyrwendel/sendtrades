import { TokenSymbol, LOCAL_TOKEN_ICONS } from '../constants/tokens';

// URLs base para buscar ícones de tokens
const ICON_SOURCES = {
  COINGECKO: 'https://api.coingecko.com/v3',
  COINMARKETCAP: 'https://s2.coinmarketcap.com/static/img/coins/64x64',
  CRYPTOLOGOS: 'https://cryptologos.cc/logos',
} as const;

// Cache de IDs do CoinGecko
const coingeckoIdCache: Record<string, string> = {};

// Função para buscar ID do token no CoinGecko
async function getCoingeckoId(symbol: string): Promise<string | null> {
  try {
    // Se já temos o ID em cache, retorna ele
    if (coingeckoIdCache[symbol]) {
      return coingeckoIdCache[symbol];
    }

    // Busca a lista de tokens no CoinGecko
    const response = await fetch(`${ICON_SOURCES.COINGECKO}/coins/list`);
    if (!response.ok) return null;

    const coins = await response.json();
    const coin = coins.find((c: any) => 
      c.symbol.toLowerCase() === symbol.toLowerCase()
    );

    if (coin?.id) {
      // Salva no cache
      coingeckoIdCache[symbol] = coin.id;
      return coin.id;
    }

    return null;
  } catch (error) {
    console.error(`Erro ao buscar ID do CoinGecko para ${symbol}:`, error);
    return null;
  }
}

// Função para buscar URL do ícone de um novo token
export async function getTokenIconUrl(symbol: string): Promise<string | null> {
  try {
    // Primeiro tenta CoinGecko
    const coinId = await getCoingeckoId(symbol);
    if (coinId) {
      const response = await fetch(`${ICON_SOURCES.COINGECKO}/coins/${coinId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.image?.large) {
          return data.image.large;
        }
      }
    }

    // Se não encontrar no CoinGecko, tenta CryptoLogos
    const cryptoLogosUrl = `${ICON_SOURCES.CRYPTOLOGOS}/${symbol.toLowerCase()}-${symbol.toLowerCase()}-logo.png`;
    const cryptoLogosResponse = await fetch(cryptoLogosUrl);
    if (cryptoLogosResponse.ok) {
      return cryptoLogosUrl;
    }

    // Por último, tenta CoinMarketCap
    const cmcUrl = `${ICON_SOURCES.COINMARKETCAP}/${symbol.toLowerCase()}.png`;
    const cmcResponse = await fetch(cmcUrl);
    if (cmcResponse.ok) {
      return cmcUrl;
    }

    return null;
  } catch (error) {
    console.error(`Erro ao buscar ícone para ${symbol}:`, error);
    return null;
  }
}

// Função para notificar o backend sobre novo token
export async function notifyNewToken(symbol: string, iconUrl: string): Promise<boolean> {
  try {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('session');
    
    if (!token) return false;

    const response = await fetch(`${API_URL}/api/tokens/new`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        symbol,
        iconUrl
      })
    });

    return response.ok;
  } catch (error) {
    console.error(`Erro ao notificar novo token ${symbol}:`, error);
    return false;
  }
}

// Função para gerenciar ícones de tokens
export async function manageTokenIcon(symbol: TokenSymbol): Promise<string> {
  // Se já temos o ícone localmente, retorna ele
  if (LOCAL_TOKEN_ICONS[symbol]) {
    return LOCAL_TOKEN_ICONS[symbol];
  }

  try {
    // Busca URL do ícone
    const iconUrl = await getTokenIconUrl(symbol);
    if (!iconUrl) {
      throw new Error(`Não foi possível encontrar ícone para ${symbol}`);
    }

    // Notifica o backend sobre o novo token
    await notifyNewToken(symbol, iconUrl);

    // Retorna a URL do ícone para uso temporário
    // O backend vai baixar e processar o ícone
    return iconUrl;

  } catch (error) {
    console.error(`Erro ao gerenciar ícone para ${symbol}:`, error);
    // Retorna um ícone genérico
    return '/assets/tokens/generic.png';
  }
} 
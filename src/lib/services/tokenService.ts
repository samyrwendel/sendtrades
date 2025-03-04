import { TokenSymbol, LOCAL_TOKEN_ICONS, TOKEN_ICONS } from '../constants/tokens';
import { Bot } from '../types';
import { Balance } from '../exchanges/mexc/types';

// Cache de tokens dinâmicos
let dynamicTokens: Set<string> = new Set();
let dynamicTokenIcons: Record<string, string> = {};

// Função para extrair tokens de um par de trading
function extractTokensFromPair(pair: string): string[] {
  const tokens: string[] = [];
  
  // Lista de quote assets conhecidos em ordem de prioridade
  const KNOWN_QUOTE_ASSETS = ['USDT', 'USDC', 'TUSD', 'BUSD', 'EUR', 'BTC', 'ETH'];
  
  // Converter par para maiúsculo
  const upperPair = pair.toUpperCase();
  
  // Tentar encontrar quote asset
  for (const quote of KNOWN_QUOTE_ASSETS) {
    if (upperPair.endsWith(quote)) {
      const base = upperPair.slice(0, -quote.length);
      if (base.length > 0) {
        tokens.push(base);
        tokens.push(quote);
        return tokens;
      }
    }
  }
  
  // Se não encontrou padrão conhecido, divide no meio
  if (upperPair.length >= 6) {
    const midPoint = Math.floor(upperPair.length / 2);
    tokens.push(upperPair.slice(0, midPoint));
    tokens.push(upperPair.slice(midPoint));
  } else {
    tokens.push(upperPair);
  }
  
  return tokens;
}

// Função para atualizar tokens baseado nos bots ativos e saldos
export async function updateTokensList(bots: Bot[], balances: Record<string, { balances: Balance[] }>) {
  const newTokens: Set<string> = new Set();
  
  // Adiciona tokens dos pares de trading
  bots.forEach(bot => {
    if (bot.tradingPair) {
      const tokens = extractTokensFromPair(bot.tradingPair);
      tokens.forEach(token => newTokens.add(token));
    }
  });
  
  // Adiciona tokens dos saldos
  Object.values(balances).forEach(botBalance => {
    botBalance.balances.forEach(balance => {
      if (balance.asset) {
        newTokens.add(balance.asset);
      }
    });
  });
  
  // Atualiza o cache de tokens
  dynamicTokens = newTokens;
  
  // Tenta carregar ícones para novos tokens
  await updateTokenIcons(Array.from(newTokens));
  
  return Array.from(newTokens);
}

// Função para atualizar ícones dos tokens
async function updateTokenIcons(tokens: string[]) {
  const iconPromises = tokens.map(async (token) => {
    // Se já temos um ícone local ou oficial, usa ele
    if (LOCAL_TOKEN_ICONS[token as TokenSymbol]) {
      dynamicTokenIcons[token] = LOCAL_TOKEN_ICONS[token as TokenSymbol];
      return;
    }
    
    if (TOKEN_ICONS[token as TokenSymbol]) {
      dynamicTokenIcons[token] = TOKEN_ICONS[token as TokenSymbol];
      return;
    }
    
    // Tenta buscar ícone do CryptoLogos
    try {
      const iconUrl = `/assets/tokens/${token.toLowerCase()}.png`;
      // Verifica se o arquivo existe
      const response = await fetch(iconUrl, { method: 'HEAD' });
      if (response.ok) {
        dynamicTokenIcons[token] = iconUrl;
      } else {
        dynamicTokenIcons[token] = '/assets/tokens/generic.png';
      }
    } catch {
      dynamicTokenIcons[token] = '/assets/tokens/generic.png';
    }
  });
  
  await Promise.all(iconPromises);
  return dynamicTokenIcons;
}

// Função para obter ícone de um token
export function getTokenIcon(token: string): string {
  return dynamicTokenIcons[token] || '/assets/tokens/generic.png';
}

// Função para verificar se um token está na lista
export function isTokenSupported(token: string): boolean {
  return dynamicTokens.has(token);
}

// Função para obter todos os tokens conhecidos
export function getAllKnownTokens(): string[] {
  return Array.from(dynamicTokens);
}

// Função para obter todos os ícones conhecidos
export function getAllTokenIcons(): Record<string, string> {
  return { ...dynamicTokenIcons };
} 
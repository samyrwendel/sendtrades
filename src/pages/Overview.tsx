import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, FilterButton, ThemeSearchInput, ThemeUpdateButton, ThemePageHeader } from '../components/ui';
import { Bot } from '../lib/types';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateMexcApiKeys } from '../lib/mexcService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { Activity, RefreshCw, Search, Bot as BotIcon, Calendar } from 'lucide-react';
import { LOCAL_TOKEN_ICONS, type TokenSymbol } from '../lib/constants/tokens';
import { manageTokenIcon } from '../lib/services/tokenIcons';
import { mexcExchange } from '../lib/exchanges/mexc';
import { UpdateIndicator } from "../components/ui/update-indicator";
import { PageLayout, PageHeader, PageFilterSection, PageContent } from "../components/ui/page-layout";
import { SearchInput } from "../components/ui/search-input";
import { themeClasses } from "../lib/theme/colors";

const API_URL = import.meta.env.VITE_API_URL;

interface Balance {
  asset: string;
  free: string;
  locked: string;
}

interface BotWithBalances extends Bot {
  balances: Balance[];
  loading: boolean;
  error?: string;
}

// Cores específicas para cada ativo baseadas em seus ícones
const ASSET_COLORS: Record<TokenSymbol, string> = {
  USDT: '#26A17B',   // Verde Tether
  USDC: '#2775CA',   // Azul USD Coin
  BUSD: '#F0B90B',   // Amarelo Binance
  BTC: '#F7931A',    // Laranja Bitcoin
  ETH: '#627EEA',    // Azul/Roxo Ethereum
  BNB: '#F3BA2F',    // Dourado BNB
  XRP: '#64748B',    // Cinza azulado mais claro para XRP
  PI: '#F7017B',     // Rosa Pi Network
  AIXBT: '#605589',  // Roxo
};

// Cores de fallback para ativos não mapeados
const FALLBACK_COLORS = [
  '#64748b', // Cinza azulado
  '#475569', // Cinza mais escuro
  '#334155', // Cinza muito escuro
  '#1e293b', // Quase preto
  '#0f172a', // Preto azulado
];

// Cache para armazenar as cores extraídas
const colorCache: Record<string, string> = {};

// Função para extrair a cor predominante de uma imagem
const extractDominantColor = async (imageUrl: string): Promise<string> => {
  // Se já temos a cor em cache, retorna ela
  if (colorCache[imageUrl]) {
    return colorCache[imageUrl];
  }

  // Cria um elemento de imagem temporário
  const img = new Image();
  img.crossOrigin = "Anonymous";

  try {
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Cria um canvas para analisar a imagem
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Não foi possível criar contexto 2D');

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Pega os dados dos pixels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let r = 0, g = 0, b = 0, count = 0;

    // Calcula a média das cores
    for (let i = 0; i < imageData.length; i += 4) {
      if (imageData[i + 3] > 128) { // Considera apenas pixels não transparentes
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }
    }

    // Calcula a média e converte para hexadecimal
    const color = count > 0
      ? `#${Math.round(r/count).toString(16).padStart(2, '0')}${Math.round(g/count).toString(16).padStart(2, '0')}${Math.round(b/count).toString(16).padStart(2, '0')}`
      : FALLBACK_COLORS[0];

    // Armazena em cache
    colorCache[imageUrl] = color;
    return color;

  } catch (error) {
    console.error(`Erro ao extrair cor de ${imageUrl}:`, error);
    return FALLBACK_COLORS[0];
  }
};

// Lista de Quote Assets conhecidos em ordem de prioridade
const KNOWN_QUOTE_ASSETS = [
  'USDT',  // Mais comum, verificar primeiro
  'USDC',
  'USDE',
  'TUSD',
  'BUSD',
  'EUR',
  'BTC',
  'ETH'
];

function extractAssetsFromTicker(ticker: string): { baseAsset: string; quoteAsset: string } {
  if (!ticker || typeof ticker !== 'string') {
    return { baseAsset: 'N/A', quoteAsset: 'N/A' };
  }

  // Converter ticker para maiúsculo para comparação
  const upperTicker = ticker.toUpperCase();

  // Tentar encontrar um Quote Asset conhecido no final do ticker
  for (const quote of KNOWN_QUOTE_ASSETS) {
    if (upperTicker.endsWith(quote)) {
      const base = upperTicker.slice(0, -quote.length);
      if (base.length > 0) {
        return { baseAsset: base, quoteAsset: quote };
      }
    }
  }

  return { baseAsset: 'N/A', quoteAsset: 'N/A' };
}

export function Overview() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [bots, setBots] = useState<Bot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [botBalances, setBotBalances] = useState<Record<string, { balances: Balance[]; loading: boolean; error?: string }>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dynamicColors, setDynamicColors] = useState<Record<string, string>>({});
  const [dynamicIcons, setDynamicIcons] = useState<Record<string, string>>({});
  const [tokenPrices, setTokenPrices] = useState<Record<string, string>>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const updateIntervalRef = useRef<NodeJS.Timeout>();
  const isSubscribedRef = useRef(true);
  const isInitialLoadRef = useRef(true);
  const previousDataRef = useRef<{
    bots: Bot[];
    balances: Record<string, { balances: Balance[]; loading: boolean; error?: string }>;
    prices: Record<string, string>;
  }>({ bots: [], balances: {}, prices: {} });

  const updateData = async () => {
    if (!isSubscribedRef.current || isRefreshing) return;
    
    try {
      const token = localStorage.getItem('session');
      if (!token) {
        navigate('/login');
        return;
      }

      setUpdateError(null);
      setIsRefreshing(true);
      
      // Log do início da atualização
      console.log('🔄 Iniciando atualização dos dados...');
      
      const botsResponse = await fetch(`${API_URL}/api/bots`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!botsResponse.ok) {
        throw new Error(t.errors.failedToLoadBots);
      }

      const data = await botsResponse.json();
      
      if (Array.isArray(data) && isSubscribedRef.current) {
        console.log(`✅ ${data.length} bots carregados`);
        
        const processedBots = data.map(bot => ({
          ...bot,
          enabled: Boolean(bot.enabled)
        }));
        
        setBots(prevBots => {
          const hasChanges = JSON.stringify(prevBots) !== JSON.stringify(processedBots);
          const newBots = hasChanges ? processedBots : prevBots;
          previousDataRef.current.bots = newBots;
          return newBots;
        });
        
        if (isSubscribedRef.current) {
          console.log('🔄 Carregando saldos...');
          const newBalances = await loadAllBalances(false);
          if (isSubscribedRef.current && newBalances) {
            console.log('✅ Saldos atualizados');
            setBotBalances(prev => {
              const merged = { ...prev };
              Object.keys(newBalances).forEach(key => {
                if (newBalances[key]?.balances?.length > 0) {
                  merged[key] = newBalances[key];
                }
              });
              previousDataRef.current.balances = merged;
              return merged;
            });
          }
          
          if (isSubscribedRef.current) {
            console.log('🔄 Atualizando preços...');
            const newPrices = await fetchTokenPrices();
            if (isSubscribedRef.current && newPrices) {
              console.log('✅ Preços atualizados');
              setTokenPrices(prev => {
                const merged = { ...prev };
                Object.keys(newPrices).forEach(key => {
                  if (newPrices[key]) {
                    merged[key] = newPrices[key];
                  }
                });
                previousDataRef.current.prices = merged;
                return merged;
              });
            }
          }
        }
      }

      if (isSubscribedRef.current) {
        setLastUpdate(new Date());
        setRetryCount(0);
        isInitialLoadRef.current = false;
        console.log('✅ Atualização concluída com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro na atualização:', error);
      if (isSubscribedRef.current) {
        setUpdateError(error instanceof Error ? error.message : t.errors.generalError);
        
        // Restaura dados anteriores
        setBots(previousDataRef.current.bots);
        setBotBalances(previousDataRef.current.balances);
        setTokenPrices(previousDataRef.current.prices);
        
        if (retryCount < MAX_RETRIES) {
          const backoffTime = Math.pow(2, retryCount) * 1000;
          console.log(`🔄 Tentando novamente em ${backoffTime/1000} segundos...`);
          setTimeout(() => {
            if (isSubscribedRef.current) {
              setRetryCount(prev => prev + 1);
              updateData();
            }
          }, backoffTime);
        } else {
          console.log('❌ Número máximo de tentativas atingido');
        }
      }
    } finally {
      if (isSubscribedRef.current) {
        // Pequeno delay antes de remover o estado de carregamento para garantir uma transição suave
        setTimeout(() => {
          if (isSubscribedRef.current) {
            setIsRefreshing(false);
            console.log('🔄 Estado de atualização removido');
          }
        }, 500);
      }
    }
  };

  // Handler para atualização manual
  const handleRefresh = () => {
    if (!isRefreshing) {
      updateData();
    }
  };

  // Função para filtrar por data
  const isWithinDateRange = (date: Date) => {
    if (dateFilter === 'all') return true;
    
    const now = new Date();
    const botDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - botDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (dateFilter) {
      case 'today':
        return diffDays <= 1;
      case 'week':
        return diffDays <= 7;
      case 'month':
        return diffDays <= 30;
      default:
        return true;
    }
  };

  // Filtrar bots com base em todos os critérios
  const filteredBots = useMemo(() => {
    return bots.filter(bot => {
      // Filtro por texto (nome, ID, par de trading ou exchange)
      const searchMatch = searchTerm.toLowerCase().trim() === '' ||
        bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bot.public_id && bot.public_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        bot.tradingPair.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bot.exchange.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por status
      const statusMatch = statusFilter === 'all' ||
        (statusFilter === 'active' && bot.enabled) ||
        (statusFilter === 'paused' && !bot.enabled);

      // Filtro por data
      const dateMatch = isWithinDateRange(bot.createdAt);

      return searchMatch && statusMatch && dateMatch;
    });
  }, [bots, searchTerm, statusFilter, dateFilter]);

  // Separar bots ativos e inativos
  const activeBots = useMemo(() => 
    filteredBots.filter(bot => Boolean(bot.enabled) === true),
    [filteredBots]
  );

  const pausedBots = useMemo(() => 
    filteredBots.filter(bot => Boolean(bot.enabled) === false),
    [filteredBots]
  );

  const totalBots = bots.length;
  const totalFilteredBots = filteredBots.length;

  // Atualização inicial e intervalo
  useEffect(() => {
    isSubscribedRef.current = true;
    isInitialLoadRef.current = true;
    
    const startUpdateCycle = async () => {
      if (!isSubscribedRef.current) return;
      
      // Limpa intervalo anterior se existir
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      
      // Força uma atualização imediata
      await updateData();
      
      // Configura novo intervalo apenas se o componente ainda estiver montado
      if (isSubscribedRef.current) {
        const interval = setInterval(() => {
          if (!document.hidden && isSubscribedRef.current && !isRefreshing) {
            updateData();
          }
        }, 10000);
        
        updateIntervalRef.current = interval;
      }
    };

    // Inicia o ciclo de atualização
    startUpdateCycle();
    
    // Handler para mudanças de visibilidade
    const handleVisibilityChange = () => {
      if (!document.hidden && isSubscribedRef.current) {
        setIsRefreshing(true);
        startUpdateCycle();
      }
    };
    
    // Handler para foco na janela
    const handleFocus = () => {
      if (isSubscribedRef.current) {
        setIsRefreshing(true);
        startUpdateCycle();
      }
    };

    // Adiciona os event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      isSubscribedRef.current = false;
      setIsRefreshing(false);
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Adiciona um useEffect específico para mudanças de rota
  useEffect(() => {
    if (location.pathname === '/overview') {
      setIsRefreshing(true);
      updateData();
    }
  }, [location.pathname]);

  const loadAllBalances = async (showLoadingState = false): Promise<Record<string, { balances: Balance[]; loading: boolean; error?: string }> | null> => {
    try {
      if (showLoadingState) {
        setIsRefreshing(true);
      }

      const promises = bots.map(async (bot) => {
        try {
          const apiKey = bot.exchange?.config?.credentials?.apiKey;
          const secretKey = bot.exchange?.config?.credentials?.secretKey;

          if (!apiKey || !secretKey) {
            return {
              id: bot.id,
              balances: [],
              loading: false,
              error: t.errors.credentialsNotConfigured
            };
          }

          const result = await validateMexcApiKeys(apiKey, secretKey);
          return {
            id: bot.id,
            balances: result.balances || [],
            loading: false,
            error: result.error
          };
        } catch (error) {
          return {
            id: bot.id,
            balances: [],
            loading: false,
            error: error instanceof Error ? error.message : t.errors.errorLoadingBalances
          };
        }
      });

      const results = await Promise.all(promises);
      const newBalancesData: Record<string, { balances: Balance[]; loading: boolean; error?: string }> = {};
      
      results.forEach(result => {
        if (result) {
          newBalancesData[result.id] = {
            balances: result.balances || [],
            loading: false,
            error: result.error
          };
        }
      });

      return newBalancesData;
    } catch (error) {
      console.error('❌ Erro ao carregar saldos:', error);
      return null;
    } finally {
      if (showLoadingState) {
        setIsRefreshing(false);
      }
    }
  };

  const fetchTokenPrices = async (): Promise<Record<string, string> | null> => {
    try {
      const totals = calculateTotalAllBots();
      const uniqueTokens = new Set(Object.keys(totals));
      const prices: Record<string, string> = {};

      const stablecoins = ['USDT', 'USDC', 'BUSD', 'TUSD'];
      
      stablecoins.forEach(token => {
        if (uniqueTokens.has(token)) {
          prices[token] = '1';
        }
      });

      const nonStableTokens = Array.from(uniqueTokens).filter(token => !stablecoins.includes(token));
      
      if (nonStableTokens.length > 0) {
        const token = localStorage.getItem('session');
        if (!token) return null;

        const response = await fetch(`${API_URL}/api/prices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ tokens: nonStableTokens })
        });

        if (!response.ok) {
          throw new Error('Falha ao obter preços');
        }

        const data = await response.json();
        return { ...prices, ...data.prices };
      }

      return prices;
    } catch (error) {
      console.error('❌ Erro ao obter preços:', error);
      return null;
    }
  };

  // Atualiza preços quando os saldos mudam
  useEffect(() => {
    fetchTokenPrices();
    const interval = setInterval(fetchTokenPrices, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, [botBalances]);

  const formatBalance = (value: string, asset: string) => {
    const num = parseFloat(value);
    const formatted = num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });

    const price = tokenPrices[asset];
    if (price) {
      const usdValue = num * parseFloat(price);
      const formattedUSD = usdValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return (
        <div className="flex flex-col items-end">
          <div className="flex items-baseline">
            <span className="text-xs text-gray-900 dark:text-[var(--md-on-surface)]">{formatted}</span>
            <span className="text-xs text-gray-500 dark:text-[var(--md-on-surface-medium)] ml-1">{asset}</span>
          </div>
          <span className="text-xs text-[var(--md-success)] dark:text-[var(--md-success-light)]">${formattedUSD}</span>
        </div>
      );
    }

    return formatted;
  };

  const calculateTotal = (balances: Balance[]) => {
    return balances.reduce((acc, balance) => {
      const total = parseFloat(balance.free) + parseFloat(balance.locked);
      return acc + total;
    }, 0);
  };

  const calculateTotalAllBots = () => {
    const totalByAsset: { [key: string]: number } = {};
    
    // Primeiro, colete todos os ativos únicos dos pares de trading
    // Inclui todos os bots quando o filtro é 'all', apenas os ativos quando é 'active',
    // e apenas os pausados quando é 'paused'
    const botsToCalculate = statusFilter === 'all' 
      ? filteredBots 
      : statusFilter === 'active' 
        ? activeBots 
        : pausedBots;
    
    botsToCalculate.forEach(bot => {
      if (bot.tradingPair) {
        const { baseAsset, quoteAsset } = extractAssetsFromTicker(bot.tradingPair);
        // Inicializa com zero se não existir
        if (!totalByAsset[baseAsset]) {
          totalByAsset[baseAsset] = 0;
        }
        if (!totalByAsset[quoteAsset]) {
          totalByAsset[quoteAsset] = 0;
        }
      }
    });
    
    // Depois, soma os saldos
    botsToCalculate.forEach(bot => {
      const botBalance = botBalances[bot.id];
      if (botBalance?.balances) {
        botBalance.balances.forEach(balance => {
          const total = parseFloat(balance.free) + parseFloat(balance.locked);
          if (totalByAsset[balance.asset] !== undefined) {
            totalByAsset[balance.asset] += total;
          } else {
            totalByAsset[balance.asset] = total;
          }
        });
      }
    });

    return totalByAsset;
  };

  const prepareTotalChartData = () => {
    const totals = calculateTotalAllBots();
    
    // Calcular valor total em USD
    const totalUSD = Object.entries(totals).reduce((acc, [asset, amount]) => {
      const price = tokenPrices[asset] || '0';
      return acc + (parseFloat(price) * amount);
    }, 0);

    // Mapear dados com valores em USD
    const data = Object.entries(totals).map(([asset, amount]) => {
      const price = tokenPrices[asset] || '0';
      const valueUSD = parseFloat(price) * amount;
      const percentage = ((valueUSD / (totalUSD || 1)) * 100).toFixed(2);
      return {
        name: asset,
        value: amount,
        valueUSD,
        percentage,
        title: `${asset}: ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${asset} ($${valueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | ${percentage}%)`,
        color: getAssetColor(asset, 0)
      };
    });

    // Ordenar por valor em USD
    return data.sort((a, b) => b.valueUSD - a.valueUSD);
  };

  const prepareChartData = (balances: Balance[]) => {
    const total = calculateTotal(balances);
    return balances
      .map((balance, index) => ({
        name: balance.asset,
        value: parseFloat(balance.free) + parseFloat(balance.locked),
        percentage: ((parseFloat(balance.free) + parseFloat(balance.locked)) / total * 100).toFixed(2),
        color: getAssetColor(balance.asset, index)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  // Função para obter a cor do ativo (versão síncrona)
  const getAssetColor = (asset: string, index: number): string => {
    if (isTokenSupported(asset)) {
      // Primeiro tenta usar a cor pré-definida
      if (ASSET_COLORS[asset as TokenSymbol]) {
        return ASSET_COLORS[asset as TokenSymbol];
      }
      // Depois tenta usar a cor dinâmica
      if (dynamicColors[asset]) {
        return dynamicColors[asset];
      }
      // Se não tiver cor ainda, usa fallback e inicia o processo de extração
      extractDominantColor(LOCAL_TOKEN_ICONS[asset as TokenSymbol])
        .then(color => {
          setDynamicColors(prev => ({...prev, [asset]: color}));
        })
        .catch(error => {
          console.error(`Erro ao extrair cor para ${asset}:`, error);
        });
    }
    return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  };

  // Função para verificar se um token é suportado
  const isTokenSupported = (token: string): token is TokenSymbol => {
    return token in LOCAL_TOKEN_ICONS;
  };

  // Função para obter URL do ícone
  const getTokenIcon = async (symbol: string): Promise<string> => {
    // Se já temos o ícone localmente
    if (LOCAL_TOKEN_ICONS[symbol as TokenSymbol]) {
      return LOCAL_TOKEN_ICONS[symbol as TokenSymbol];
    }
    
    // Se já temos o ícone dinâmico
    if (dynamicIcons[symbol]) {
      return dynamicIcons[symbol];
    }

    try {
      // Busca o ícone
      const iconUrl = await manageTokenIcon(symbol as TokenSymbol);
      // Atualiza o estado com o novo ícone
      setDynamicIcons(prev => ({...prev, [symbol]: iconUrl}));
      return iconUrl;
    } catch (error) {
      console.error(`Erro ao obter ícone para ${symbol}:`, error);
      return '/assets/tokens/generic.png';
    }
  };

  // Adiciona um useEffect específico para monitorar dados zerados
  useEffect(() => {
    const monitorEmptyData = () => {
      // Verifica se os dados estão zerados
      const isDataEmpty = !bots.length || Object.keys(botBalances).length === 0;
      const hasNoError = !error && !updateError;
      
      if (isDataEmpty && hasNoError && !isRefreshing) {
        console.log('📊 Dados vazios detectados, forçando atualização...');
        setIsRefreshing(true);
        updateData();
      }
    };

    // Monitora a cada 5 segundos
    const monitorInterval = setInterval(monitorEmptyData, 5000);

    // Executa imediatamente na primeira vez
    monitorEmptyData();

    return () => {
      clearInterval(monitorInterval);
    };
  }, [bots, botBalances, error, updateError, isRefreshing]);

  // Adiciona um useEffect para monitorar mudanças de visibilidade da página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && location.pathname === '/overview') {
        console.log('🔄 Página voltou a ficar visível, verificando dados...');
        const isDataEmpty = !bots.length || Object.keys(botBalances).length === 0;
        if (isDataEmpty && !isRefreshing) {
          console.log('📊 Dados vazios detectados, forçando atualização...');
          setIsRefreshing(true);
          updateData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [bots, botBalances, location.pathname, isRefreshing]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (isInitialLoadRef.current && !bots.length) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg text-gray-600 dark:text-gray-300">
          {t.common.loading}
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <ThemePageHeader title={t.dashboard.overview}>
        {updateError && (
          <div className="text-sm text-[var(--md-error)] dark:text-[var(--md-error-light)] mr-2">
            {updateError}
          </div>
        )}
        <ThemeUpdateButton
          isUpdating={isRefreshing}
          onClick={() => {
            setIsRefreshing(true);
            updateData();
          }}
          className="ml-2"
        />
      </ThemePageHeader>

      <PageFilterSection>
        <div className="w-full flex flex-col md:flex-row gap-2 md:gap-4">
          <ThemeSearchInput
            placeholder="Buscar por nome, ID, par ou exchange..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:flex-1"
          />
          <div className="flex w-full md:w-auto gap-2 md:gap-4 justify-center">
            <FilterButton
              icon={BotIcon}
              label="Todos os Bots"
              value={statusFilter}
              onValueChange={setStatusFilter as (value: string) => void}
              options={[
                { value: 'all', label: 'Todos os Bots' },
                { value: 'active', label: 'Bots Ativos' },
                { value: 'paused', label: 'Bots Pausados' }
              ]}
            />
            <FilterButton
              icon={Calendar}
              label="Todas as Datas"
              value={dateFilter}
              onValueChange={setDateFilter as (value: string) => void}
              options={[
                { value: 'all', label: 'Todas as Datas' },
                { value: 'today', label: 'Hoje' },
                { value: 'week', label: 'Última semana' },
                { value: 'month', label: 'Último mês' }
              ]}
            />
          </div>
        </div>
        {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
          <div className={themeClasses.text.small}>
            Exibindo {totalFilteredBots} de {totalBots} bots
          </div>
        )}
      </PageFilterSection>

      <PageContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className={`lg:col-span-2 ${themeClasses.card.base}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-[var(--md-on-surface)]">
                {t.dashboard.totalBalanceByAsset}
              </CardTitle>
              <Activity className={themeClasses.icon.secondary + " h-4 w-4"} />
            </CardHeader>
            <CardContent>
              {Object.entries(calculateTotalAllBots()).length > 0 ? (
                <>
                  <div className="h-2 w-full flex rounded-full overflow-hidden mb-1 bg-gray-100 dark:bg-[var(--md-surface-2)]">
                    {prepareTotalChartData().map((entry) => (
                      <div
                        key={entry.name}
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${entry.percentage}%`,
                          backgroundColor: entry.color
                        }}
                        title={entry.title}
                      />
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 mb-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Detalhamento por Ativo</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Última atualização: {lastUpdate.toLocaleTimeString()}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {prepareTotalChartData().map((entry) => (
                      <div 
                        key={entry.name} 
                        className="flex items-center p-2.5 md:p-3 rounded-lg bg-white dark:bg-[var(--md-surface-1)] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                        style={{ 
                          borderLeftColor: entry.color,
                          borderLeftWidth: '3px'
                        }}
                      >
                        <div className="flex w-full">
                          <div className="flex flex-col items-start mr-2 w-20 md:w-28">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 md:w-4 md:h-4 rounded-full mr-1.5 md:mr-2"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="font-medium text-gray-900 dark:text-[var(--md-on-surface)] text-xs md:text-sm">{entry.name}</span>
                            </div>
                            <span className="text-[10px] md:text-xs text-gray-500 dark:text-[var(--md-on-surface-medium)] ml-4 md:ml-6">
                              {entry.percentage}%
                            </span>
                          </div>
                          <div className="flex flex-col flex-1 items-end">
                            <span className="text-xs md:text-sm text-gray-900 dark:text-[var(--md-on-surface)]">
                              {entry.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                            </span>
                            <span className="text-xs md:text-xs text-[var(--md-success)] dark:text-[var(--md-success-light)]">
                              ${entry.valueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 dark:text-[var(--md-on-surface-medium)]">
                  {t.dashboard.noBalancesAvailable}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[var(--md-surface-1)] border-gray-200 dark:border-[var(--md-surface-4)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-[var(--md-on-surface)]">
                Status dos Bots
              </CardTitle>
              <BotIcon className="h-4 w-4 text-gray-500 dark:text-[var(--md-on-surface-medium)]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-[var(--md-success)] dark:text-[var(--md-success-light)]">Ativos</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-[var(--md-on-surface)]">{activeBots.length}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--md-warning)] dark:text-[var(--md-warning-light)]">Pausados</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-[var(--md-on-surface)]">{filteredBots.filter(bot => !bot.enabled).length}</div>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-[var(--md-surface-4)]">
                  <p className="text-xs text-gray-500 dark:text-[var(--md-on-surface-medium)]">
                    {t.dashboard.totalBots}: {totalBots}
                  </p>
                  {Object.keys(calculateTotalAllBots()).length > 0 && (
                    <div className="text-sm mt-2">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-[var(--md-on-surface-medium)]">Total: </span>
                        <span className="text-[var(--md-success)] dark:text-[var(--md-success-light)] font-medium text-xl">
                          ${Object.entries(calculateTotalAllBots()).reduce((acc, [asset, amount]) => {
                            const price = tokenPrices[asset] || '0';
                            return acc + (parseFloat(price) * amount);
                          }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-[var(--md-on-surface-medium)] mt-1">
                        Última atualização: {lastUpdate.toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {filteredBots.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--md-on-surface)]">
                {statusFilter === 'all' 
                  ? 'Todos os Bots'
                  : statusFilter === 'active'
                    ? 'Bots Ativos'
                    : 'Bots Pausados'}
              </h2>
            </div>

            {filteredBots.length === 0 ? (
              <div className={themeClasses.text.secondary + " text-center py-8"}>
                {t.dashboard.noBotsFound}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredBots.map(bot => {
                  const botBalance = botBalances[bot.id];
                  const { baseAsset, quoteAsset } = extractAssetsFromTicker(bot.tradingPair);
                  const balanceMap = new Map(botBalance?.balances.map(b => [b.asset, b]));
                  const relevantBalances = [baseAsset, quoteAsset].map(asset => {
                    return balanceMap.get(asset) || {
                      asset,
                      free: '0',
                      locked: '0'
                    };
                  }).concat(
                    botBalance?.balances.filter(b => 
                      b.asset !== baseAsset && 
                      b.asset !== quoteAsset && 
                      (parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
                    ) || []
                  ).sort((a, b) => {
                    const totalA = parseFloat(a.free) + parseFloat(a.locked);
                    const totalB = parseFloat(b.free) + parseFloat(b.locked);
                    return totalB - totalA;
                  });

                  const chartData = relevantBalances ? prepareChartData(relevantBalances) : [];

                  return (
                    <Card key={bot.id} className={`${themeClasses.card.base} hover:shadow-lg transition-shadow`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className={themeClasses.text.primary + " text-base"}>{bot.name}</CardTitle>
                            <div className={themeClasses.text.small}>
                              ID: {bot.public_id}
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                            bot.enabled 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                          }`}>
                            {bot.enabled ? 'Ativo' : 'Pausado'}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Trading Info */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className={themeClasses.text.secondary}>Par:</span>
                            <div className={themeClasses.text.primary}>{bot.tradingPair}</div>
                          </div>
                          <div className="text-right">
                            <span className={themeClasses.text.secondary}>Exchange:</span>
                            <div className={themeClasses.text.primary}>{bot.exchange.name}</div>
                          </div>
                        </div>

                        {/* Estatísticas */}
                        <div>
                          <div className={themeClasses.text.secondary + " text-xs font-medium mb-1"}>{t.bots.statistics}</div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="flex flex-col items-center">
                              <div className={themeClasses.text.secondary + " text-center"}>{t.bots.totalTrades}</div>
                              <div className={themeClasses.text.primary + " text-sm"}>{bot.statistics?.totalTrades || 0}</div>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className={themeClasses.text.secondary + " text-center"}>{t.bots.winRate}</div>
                              <div className={themeClasses.text.primary + " text-sm"}>{bot.statistics?.winRate || '0'}</div>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className={themeClasses.text.secondary + " text-center"}>{t.bots.profitLoss}</div>
                              <div className={`text-sm text-center ${
                                bot.statistics?.profitLoss?.startsWith('-') 
                                  ? 'text-red-500 dark:text-red-400' 
                                  : bot.statistics?.profitLoss === '0' || !bot.statistics?.profitLoss
                                    ? themeClasses.text.primary
                                    : 'text-emerald-500 dark:text-emerald-400'
                              }`}>
                                {bot.statistics?.profitLoss || '0'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Datas */}
                        <div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className={themeClasses.text.secondary}>{t.bots.createdAt}</div>
                              <div className={themeClasses.text.primary}>{new Date(bot.createdAt).toLocaleString()}</div>
                            </div>
                            <div>
                              <div className={themeClasses.text.secondary}>{t.bots.updatedAt}</div>
                              <div className={themeClasses.text.primary}>{new Date(bot.updatedAt).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>

                        {/* Saldos */}
                        <div>
                          <div className="text-sm font-medium text-gray-500 dark:text-[var(--md-on-surface-medium)] mb-2">Saldos</div>
                          {botBalance?.loading ? (
                            <div className="flex items-center justify-center py-2">
                              <RefreshCw className="h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
                            </div>
                          ) : botBalance?.error ? (
                            <div className="text-sm text-red-500 dark:text-red-400">
                              {botBalance.error}
                            </div>
                          ) : relevantBalances && relevantBalances.length > 0 ? (
                            <>
                              <div className="space-y-2">
                                {relevantBalances.map(balance => (
                                  <div key={balance.asset} className="flex justify-between text-sm">
                                    <span className="text-xs text-gray-500 dark:text-[var(--md-on-surface-medium)]">{balance.asset}</span>
                                    <div className="text-right">
                                      <div>
                                        {formatBalance(balance.free, balance.asset)}
                                      </div>
                                      {parseFloat(balance.locked) > 0 && (
                                        <div className="text-xs text-gray-500 dark:text-[var(--md-on-surface-medium)]">
                                          {formatBalance(balance.locked, balance.asset)} {t.trading.inOrder}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Gráfico de Distribuição */}
                              {chartData.length > 0 && (
                                <div className="mt-3">
                                  <div className="h-2 w-full flex rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    {chartData.map((entry) => (
                                      <div
                                        key={entry.name}
                                        className="h-full transition-all duration-300"
                                        style={{
                                          width: `${entry.percentage}%`,
                                          backgroundColor: entry.color
                                        }}
                                        title={`${entry.name}: ${entry.percentage}%`}
                                      />
                                    ))}
                                  </div>
                                  <div className="flex flex-wrap gap-1 text-xs mt-1">
                                    {chartData.map((entry) => (
                                      <div key={entry.name} className="flex items-center gap-1">
                                        <div className="flex items-center gap-1">
                                          <div 
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: entry.color }}
                                          />
                                          <div className="relative flex items-center">
                                            {isTokenSupported(entry.name) ? (
                                              <>
                                                <div 
                                                  className="absolute inset-0 rounded-full"
                                                  style={{ backgroundColor: entry.color, opacity: 0.15 }}
                                                />
                                                <img 
                                                  src={dynamicIcons[entry.name] || LOCAL_TOKEN_ICONS[entry.name] || '/assets/tokens/generic.png'} 
                                                  alt={entry.name}
                                                  className="w-3 h-3 rounded-full relative z-10"
                                                  onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                  }}
                                                />
                                              </>
                                            ) : (
                                              <div 
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: entry.color, opacity: 0.15 }}
                                              />
                                            )}
                                          </div>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-[var(--md-on-surface-medium)]">{entry.name} ({entry.percentage}%)</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-[var(--md-on-surface-medium)] text-center">
                              {t.dashboard.noBalancesAvailable}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </PageContent>
    </PageLayout>
  );
} 
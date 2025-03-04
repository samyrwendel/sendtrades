import * as React from 'react';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { validateMexcApiKeys } from '../lib/mexcService';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { SimplePairSelector } from '../components/SimplePairSelector';
import { Label, Input, Button } from '../components/ui';
import { ExchangeLogo } from '../components/ExchangeLogo';
import { Bot, WebhookConfig, SupportedExchange, MexcSymbol } from '../lib/types';
import { getAvailablePairs } from '../lib/mexcService';
import { validateIPList } from '../lib/utils/validation';
import { toast } from 'sonner';
import axios from 'axios';
import { EXCHANGE_LOGOS } from '../lib/exchanges/constants';
import { useAuth } from '../hooks/useAuth';
import copy from 'copy-to-clipboard';
import { CopyButton } from '../components/CopyButton';

// Definição das exchanges suportadas
const EXCHANGES = [
  {
    name: 'MEXC' as const,
    logo: 'MEXC',
    credentialFields: [
      { name: 'API Key', key: 'apiKey', type: 'text', placeholder: 'Sua API Key da MEXC' },
      { name: 'Secret Key', key: 'secretKey', type: 'password', placeholder: 'Sua Secret Key da MEXC' }
    ]
  },
  {
    name: 'BINANCE' as const,
    logo: 'BINANCE',
    credentialFields: [
      { name: 'API Key', key: 'apiKey', type: 'text', placeholder: 'Sua API Key da Binance' },
      { name: 'Secret Key', key: 'secretKey', type: 'password', placeholder: 'Sua Secret Key da Binance' }
    ]
  }
] as const;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface BotFormData {
  name: string;
  tradingPair: string;
  botId: string;
  public_id: string;
}

interface Balance {
  asset: string;
  free: string;
  locked: string;
}

interface CredentialField {
  name: string;
  key: string;
  type: string;
  placeholder: string;
}

interface ExtendedExchangeConfig {
  name: SupportedExchange;
  config: {
    credentials: {
      apiKey: string;
      secretKey: string;
    };
    tradingInfo?: {
      baseAsset: string;
      quoteAsset: string;
      minOrderSize: string;
      maxOrderSize: string;
    };
  };
}

const DEFAULT_EXCHANGE: SupportedExchange = 'MEXC';

interface BotDataType {
  name: string;
  tradingPair: string;
  enabled: boolean;
  exchange: {
    name: SupportedExchange;
    config: {
      credentials: {
        apiKey: string;
        secretKey: string;
      };
    };
  };
  webhook: {
    enabled: boolean;
    url: string;
    secretKey: string;
    allowedIPs: string[];
    maxOrdersPerMinute: number;
  };
  settings: {
    maxOrderSize: string;
    minOrderSize: string;
    maxDailyOrders: number;
    tradingEnabled: boolean;
    notifications: {
      email: boolean;
      telegram: boolean;
    };
  };
  statistics: {
    totalTrades: number;
    successfulTrades: number;
    failedTrades: number;
    lastTradeAt: Date | null;
    profitLoss: string;
    winRate: string;
  };
}

function isValidExchange(exchange: string): exchange is SupportedExchange {
  return ['MEXC', 'BINANCE', 'KUCOIN', 'BYBIT', 'COINBASE', 'KRAKEN'].includes(exchange);
}

// Lista de Quote Assets conhecidos em ordem de prioridade
const KNOWN_QUOTE_ASSETS = [
  'USDT',
  'USDC',
  'USDE',
  'TUSD',
  'BUSD',
  'EUR',
  'BTC',
  'ETH'
];

// Função para extrair Base e Quote Assets do par de trading
function extractAssetsFromPair(pair: string): { baseAsset: string; quoteAsset: string } {
  if (!pair || typeof pair !== 'string') {
    console.log('❌ Par inválido:', pair);
    return { baseAsset: '', quoteAsset: '' };
  }

  // Converter ticker para maiúsculo para comparação
  const upperPair = pair.toUpperCase();
  console.log('🔍 Analisando par:', upperPair);

  // Tentar encontrar um Quote Asset conhecido no final do ticker
  for (const quote of KNOWN_QUOTE_ASSETS) {
    console.log('  Verificando Quote Asset:', quote);
    if (upperPair.endsWith(quote)) {
      const base = upperPair.slice(0, -quote.length);
      if (base.length > 0) {
        console.log('✅ Quote Asset encontrado:', {
          pair: upperPair,
          baseAsset: base,
          quoteAsset: quote
        });
        return { baseAsset: base, quoteAsset: quote };
      }
    }
  }

  // Se não encontrou nenhum Quote Asset conhecido, tentar extrair da estrutura do par
  const parts = upperPair.split('/');
  if (parts.length === 2) {
    console.log('✅ Par separado por "/":', {
      pair: upperPair,
      baseAsset: parts[0],
      quoteAsset: parts[1]
    });
    return { baseAsset: parts[0], quoteAsset: parts[1] };
  }

  console.log('❌ Não foi possível extrair Quote Asset do par:', upperPair);
  return { baseAsset: '', quoteAsset: '' };
}

// Função para normalizar o par de trading (remover barra se existir)
const normalizeTradingPair = (pair: string): string => {
  // Remove espaços e converte para maiúsculo
  const normalized = pair.trim().toUpperCase();
  // Se contém barra, remove a barra
  return normalized.replace('/', '');
};

export function NewBots() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  // Verifica se está no modo de edição
  const isEditing = Boolean(id);
  console.log('🔄 Modo do NewBots:', {
    isEditing,
    id,
    pathname: location.pathname
  });

  // Estados iniciais baseados no modo (edição ou criação)
  const [formData, setFormData] = React.useState<BotFormData>({
    name: '',
    tradingPair: '',
    botId: '',
    public_id: ''
  });

  const [selectedExchange, setSelectedExchange] = React.useState<SupportedExchange>(DEFAULT_EXCHANGE);
  const [credentials, setCredentials] = React.useState<Record<string, string>>({});
  const [botData, setBotData] = React.useState<Bot | null>(null);
  const [isValidating, setIsValidating] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [balances, setBalances] = React.useState<Balance[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [webhookConfig, setWebhookConfig] = React.useState({
    secretKey: '',
    allowedIPs: '',
    maxOrdersPerMinute: 60
  });
  const [quoteAsset, setQuoteAsset] = React.useState<string>('');
  const [quoteAssets, setQuoteAssets] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [pairs, setPairs] = React.useState<any[]>([]);
  const [step, setStep] = React.useState<'exchange' | 'credentials' | 'trading'>(
    isEditing ? 'trading' : 'exchange'
  );
  console.log('🔄 Estado inicial do step:', { step, isEditing });
  const [alertName, setAlertName] = React.useState<string>('');
  const [positionSize, setPositionSize] = React.useState<'100' | '50' | '25' | 'strategy'>('100');
  const [isSaving, setIsSaving] = React.useState(false);
  const [ipValidationError, setIpValidationError] = React.useState<string | null>(null);

  // Atualiza o título e textos dos botões baseado no modo
  const pageTitle = isEditing ? t.bots.editBot : t.bots.createBot;
  const saveButtonText = isEditing ? t.common.save : t.common.create;

  // Efeito para carregar dados do bot em modo de edição
  React.useEffect(() => {
    const loadBotData = async () => {
      try {
        if (id) {
          setLoading(true);
          const token = localStorage.getItem('session');
          console.log('🔄 Carregando dados do bot:', { id });
          
          const response = await fetch(`${API_URL}/api/bots/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Falha ao carregar dados do bot');
          }

          const data = await response.json();
          console.log('📥 Dados do bot carregados:', data);

          // Extrair Base e Quote Assets do par de trading
          const { baseAsset, quoteAsset } = data.exchange?.config?.tradingInfo?.baseAsset 
            ? { 
                baseAsset: data.exchange.config.tradingInfo.baseAsset,
                quoteAsset: data.exchange.config.tradingInfo.quoteAsset
              }
            : extractAssetsFromPair(data.tradingPair);

          console.log('📊 Assets extraídos:', { baseAsset, quoteAsset });

          // Atualizar dados do bot
          setBotData(data);
          setFormData({
            name: data.name || '',
            tradingPair: data.tradingPair || '',
            botId: data.id || '',
            public_id: data.public_id || ''
          });

          // Atualizar credenciais
          if (data.exchange?.config?.credentials) {
            setCredentials(data.exchange.config.credentials);
            // Em modo de edição, assumimos que as credenciais são válidas
            setBalances([{ asset: quoteAsset, free: '0', locked: '0' }]);
          }

          // Atualizar configuração de webhook
          if (data.webhook) {
            setWebhookConfig({
              secretKey: data.webhook.secretKey || '',
              allowedIPs: Array.isArray(data.webhook.allowedIPs) 
                ? data.webhook.allowedIPs.join(', ') 
                : '',
              maxOrdersPerMinute: data.webhook.maxOrdersPerMinute || 60
            });
          }

          // Atualizar exchange selecionada
          if (data.exchange?.name && isValidExchange(data.exchange.name)) {
            setSelectedExchange(data.exchange.name);
          }

          // Carregar pares disponíveis e depois atualizar o Quote Asset
          const pairsResult = await loadPairs();
          if (pairsResult?.success && pairsResult.pairs) {
            // Verificar se o Quote Asset do bot existe nos pares disponíveis
            const quotes = [...new Set(pairsResult.pairs.map(p => p.quoteAsset))].sort();
            if (quotes.includes(quoteAsset)) {
              setQuoteAsset(quoteAsset);
              console.log('🎯 Quote Asset do bot definido:', quoteAsset);
            } else {
              // Se não encontrar, usar o primeiro disponível
              const defaultQuote = quotes[0] || 'USDT';
              setQuoteAsset(defaultQuote);
              console.log('⚠️ Quote Asset do bot não encontrado, usando padrão:', defaultQuote);
            }
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do bot:', error);
        setError(error instanceof Error ? error.message : 'Erro ao carregar dados do bot');
      } finally {
        setLoading(false);
      }
    };

    loadBotData();
  }, [id]);

  React.useEffect(() => {
    if (selectedExchange) {
      const exchange = EXCHANGES.find(e => e.name === selectedExchange);
      if (exchange) {
        const initialCredentials: Record<string, string> = {};
        exchange.credentialFields.forEach(field => {
          initialCredentials[field.key] = '';
        });
        setCredentials(initialCredentials);
      }
    }
  }, [selectedExchange]);

  React.useEffect(() => {
    // Atualiza a sugestão do Alert Name quando o nome do bot mudar
    const suggestedName = formData.name ? 
      `${formData.name} - ${formData.tradingPair} Strategy` : 
      'My Trading Strategy';
    setAlertName(suggestedName);
  }, [formData.name, formData.tradingPair]);

  const loadPairs = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando carregamento de pares...');
      
      const result = await getAvailablePairs();
      if (result.success && result.pairs) {
        console.log('✅ Pares carregados:', {
          total: result.pairs.length,
          exemplo: result.pairs[0]
        });
        
        setPairs(result.pairs);
        const quotes = [...new Set(result.pairs.map(p => p.quoteAsset))].sort();
        setQuoteAssets(quotes);
        
        console.log('📊 Quote Assets disponíveis:', quotes);
        
        // Em modo de edição, mantenha o Quote Asset atual se existir nos pares disponíveis
        if (isEditing && quoteAsset && quotes.includes(quoteAsset)) {
          console.log('🔒 Mantendo Quote Asset atual em modo de edição:', quoteAsset);
        } else {
          const newQuoteAsset = quotes[0] || 'USDT';
          console.log('🎯 Definindo novo Quote Asset:', newQuoteAsset);
          setQuoteAsset(newQuoteAsset);
        }

        // Se estiver em modo de edição e tiver um par selecionado,
        // verificar se ele existe nos pares disponíveis
        if (isEditing && formData.tradingPair) {
          const selectedPair = result.pairs.find(p => 
            p.symbol === formData.tradingPair || 
            p.symbol === normalizeTradingPair(formData.tradingPair)
          );
          console.log('🔍 Verificando par selecionado:', {
            procurado: formData.tradingPair,
            normalizado: normalizeTradingPair(formData.tradingPair),
            encontrado: selectedPair
          });
          
          if (selectedPair) {
            // Atualizar o formData com as informações completas do par
            setFormData(prev => ({
              ...prev,
              tradingPair: selectedPair.symbol,
              baseAsset: selectedPair.baseAsset,
              quoteAsset: selectedPair.quoteAsset
            }));
          }
        }

        return result;
      } else {
        console.error('❌ Erro ao carregar pares:', result.error);
        setError(result.error || 'Erro ao carregar pares de trading');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar pares:', err);
      setError('Erro ao carregar pares de trading');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const areCredentialsComplete = () => {
    const exchange = EXCHANGES.find(e => e.name === selectedExchange);
    if (!exchange) return false;
    
    return exchange.credentialFields.every(field => credentials[field.key]?.trim());
  };

  const handleValidateCredentials = async () => {
    if (!areCredentialsComplete()) {
      setValidationError(t.errors.fillAllCredentials);
      return;
    }

    setIsValidating(true);
    setValidationError(null);
    setBalances([]);
    
    try {
      // Primeiro valida as credenciais e obtém os saldos
      let result;
      switch (selectedExchange) {
        case 'MEXC':
          result = await validateMexcApiKeys(credentials.apiKey, credentials.secretKey);
          break;
        default:
          throw new Error(t.errors.unsupportedExchange);
      }
      
      if (!result.isValid) {
        setValidationError(result.error || t.errors.invalidCredentials);
        return;
      }

      // Verifica se há saldos disponíveis
      if (!result.balances || result.balances.length === 0) {
        setValidationError('Nenhum saldo disponível na conta');
        return;
      }

      // Atualiza os saldos no estado
      const availableBalances = result.balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);
      setBalances(availableBalances);

      // Se tiver saldos, carrega os pares de trading
      await loadPairs();

      // Agora que validamos os saldos, obtém o public_id do servidor
      const response = await axios.post(`${API_URL}/api/bots/validate-credentials`, {
        exchange: selectedExchange,
        credentials: {
          apiKey: credentials.apiKey,
          secretKey: credentials.secretKey
        }
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session')}`
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao validar credenciais no servidor');
      }

      // Atualiza o formData com o public_id recebido
      setFormData(prev => ({
        ...prev,
        public_id: response.data.public_id
      }));

      // Avança para o próximo passo
      setStep('trading');
      toast.success(t.bots.apiKeysValidated);

    } catch (error: unknown) {
      console.error('❌ Erro ao validar credenciais:', error);
      setValidationError(
        error instanceof Error ? error.message : t.errors.invalidCredentials
      );
    } finally {
      setIsValidating(false);
    }
  };

  const getJsonTemplate = (size: string) => {
    const orderSize = size === 'strategy' ? '{{strategy.order.contracts}}' : `${size}%`;
    return `{
  "action": "{{strategy.order.action}}",
  "ticker": "{{ticker}}",
  "order_size": "${orderSize}",
  "position_size": "{{strategy.position_size}}",
  "schema": "2",
  "timestamp": {{time}},
  "public_id": "${formData.public_id || 'YOUR_BOT_PUBLIC_ID'}"
}`;
  };

  const examplePayloads = [
    {
      action: "buy",
      ticker: "BTCUSD",
      order_size: "100%",
      position_size: "1",
      schema: "2",
      timestamp: "2025-02-08T02:12:18.313Z",
      public_id: formData.public_id || "YOUR_BOT_PUBLIC_ID"
    },
    {
      action: "buy",
      ticker: "BTCUSD",
      order_size: "25%",
      position_size: "1",
      schema: "2",
      timestamp: "2025-02-08T02:12:51.028Z",
      public_id: formData.public_id || "YOUR_BOT_PUBLIC_ID"
    },
    {
      action: "buy",
      ticker: "BTCUSD",
      order_size: "50%",
      position_size: "50%",
      schema: "2",
      timestamp: "2025-02-08T02:13:02.336Z",
      public_id: formData.public_id || "YOUR_BOT_PUBLIC_ID"
    }
  ];

  const handleExchangeSelect = (exchangeName: SupportedExchange) => {
    setSelectedExchange(exchangeName);
    setStep('credentials');
  };

  const handleSaveBot = async () => {
    try {
      console.group('🤖 Salvando Bot');
      
      // Validações
      if (!formData.name || !formData.tradingPair || !formData.public_id) {
        console.error('❌ Dados incompletos:', { 
          name: formData.name, 
          tradingPair: formData.tradingPair,
          public_id: formData.public_id
        });
        toast.error('Nome, par de trading e validação de credenciais são obrigatórios');
        return;
      }

      // Normalizar o par de trading
      const normalizedPair = normalizeTradingPair(formData.tradingPair);
      console.log('🔄 Par normalizado:', {
        original: formData.tradingPair,
        normalized: normalizedPair
      });

      // Extrair Base e Quote Assets do par de trading
      const { baseAsset, quoteAsset } = extractAssetsFromPair(formData.tradingPair);
      console.log('📊 Assets extraídos:', { baseAsset, quoteAsset });

      if (!baseAsset || !quoteAsset) {
        console.error('❌ Não foi possível extrair Base/Quote Asset do par:', formData.tradingPair);
        toast.error('Par de trading inválido. Formato esperado: BTC/USDC, BTCUSDC, etc.');
        return;
      }

      // Preparar payload
      const payload = {
        id: formData.botId,
        name: formData.name,
        tradingPair: normalizedPair, // Usar o par normalizado
        public_id: formData.public_id,
        enabled: botData?.enabled ?? false,
        exchange: {
          name: selectedExchange,
          config: {
            credentials: {
              apiKey: credentials.apiKey,
              secretKey: credentials.secretKey
            },
            testnet: false,
            tradingInfo: {
              baseAsset,
              quoteAsset,
              maxOrderSize: botData?.exchange?.tradingInfo?.maxOrderSize ?? '10',
              minOrderSize: botData?.exchange?.tradingInfo?.minOrderSize ?? '0.0001',
              precision: 8,
              status: "TRADING"
            }
          }
        },
        webhook: {
          enabled: true,
          secretKey: webhookConfig.secretKey,
          allowedIPs: webhookConfig.allowedIPs.split(',').map(ip => ip.trim()),
          maxOrdersPerMinute: parseInt(webhookConfig.maxOrdersPerMinute.toString()) || 60
        },
        settings: botData?.settings ?? {
          maxOrderSize: "100",
          minOrderSize: "10",
          maxDailyOrders: 100,
          tradingEnabled: true,
          notifications: {
            email: false,
            telegram: false
          }
        },
        statistics: botData?.statistics ?? {
          totalTrades: 0,
          successfulTrades: 0,
          failedTrades: 0,
          lastTradeAt: null,
          profitLoss: '0',
          winRate: '0'
        }
      };

      console.log('📦 Payload preparado:', payload);

      // Faz a requisição para criar ou atualizar o bot
      const url = isEditing ? `${API_URL}/api/bots/${id}` : `${API_URL}/api/bots`;
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session')}`
        }
      });

      if (response.data.success) {
        toast.success(isEditing ? t.success.botUpdated : t.success.botCreated);
        navigate('/bots');
      } else {
        throw new Error(response.data.message || t.errors.generalError);
      }
    } catch (error: unknown) {
      console.error('❌ Erro ao salvar bot:', error);
      toast.error(
        error instanceof Error ? error.message : t.errors.generalError
      );
    } finally {
      setIsSaving(false);
      console.groupEnd();
    }
  };

  // Altere a função getCurrentTimestamp para retornar o formato ISO
  const getCurrentTimestamp = () => new Date().toISOString();

  // Efeito para garantir que o step seja 'trading' quando estiver em modo de edição
  React.useEffect(() => {
    if (isEditing) {
      setStep('trading');
    }
  }, [isEditing]);

  const handlePairSelect = (pair: MexcSymbol) => {
    if (formData.tradingPair === pair.symbol) return; // Evita atualizações desnecessárias
    
    setFormData(prev => ({
      ...prev,
      tradingPair: pair.symbol,
      baseAsset: pair.baseAsset,
      quoteAsset: pair.quoteAsset
    }));
  };

  if (loading && step !== 'exchange') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-indigo-100">
          {isEditing ? t.bots.editBot : t.bots.createBot}
        </h1>
        <p className="text-gray-500 dark:text-indigo-300/70 mt-2">
          {t.bots.editBotDescription}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-4 h-4 rounded-full ${step === 'exchange' ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-300 dark:bg-indigo-900/30'}`} />
          <div className="h-0.5 flex-1 bg-gray-300 dark:bg-indigo-800" />
          <div className={`w-4 h-4 rounded-full ${step === 'credentials' ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-300 dark:bg-indigo-900/30'}`} />
          <div className="h-0.5 flex-1 bg-gray-300 dark:bg-indigo-800" />
          <div className={`w-4 h-4 rounded-full ${step === 'trading' ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-300 dark:bg-indigo-900/30'}`} />
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-indigo-300">
          <span>{t.bots.selectExchange}</span>
          <span>{t.bots.validateAndContinue}</span>
          <span>{t.bots.tradingPair}</span>
        </div>
      </div>

      {step === 'exchange' && !isEditing && (
        <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur p-6 rounded-lg shadow-sm border border-gray-100 dark:border-indigo-800/30">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-indigo-100">{t.bots.selectExchange}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {EXCHANGES.map((exchange) => (
              <button
                key={exchange.name}
                type="button"
                onClick={() => handleExchangeSelect(exchange.name as SupportedExchange)}
                className={`p-4 border rounded-lg flex items-center gap-2 transition-colors ${
                  selectedExchange === exchange.name
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50 dark:border-indigo-400'
                    : 'border-gray-200 dark:border-indigo-800/30 hover:bg-gray-50 dark:hover:bg-indigo-900/30'
                }`}
              >
                <ExchangeLogo exchangeName={exchange.logo} />
                <span className="text-gray-900 dark:text-indigo-100">{exchange.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'credentials' && !isEditing && (
        <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur p-6 rounded-lg shadow-sm border border-gray-100 dark:border-indigo-800/30">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-indigo-100">
            {t.bots.selectExchange} {selectedExchange}
          </h2>
          <div className="space-y-4">
            {EXCHANGES.find(e => e.name === selectedExchange)?.credentialFields.map((field) => (
              <div key={field.key} className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-gray-700 dark:text-indigo-200">
                  {field.name}
                </Label>
                <Input
                  type={field.type}
                  value={credentials[field.key] || ''}
                  onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                  className="col-span-3 bg-white dark:bg-gray-900/50 border-gray-200 dark:border-indigo-800/30"
                  placeholder={field.placeholder}
                />
              </div>
            ))}

            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="col-start-2 col-span-3 flex gap-4">
                <Button
                  onClick={() => setStep('exchange')}
                  className="bg-white dark:bg-gray-800 text-gray-700 dark:text-indigo-200"
                >
                  {t.common.back}
                </Button>
                <Button
                  onClick={handleValidateCredentials}
                  disabled={isValidating || !areCredentialsComplete()}
                  className="bg-indigo-600 dark:bg-indigo-500 text-white"
                >
                  {isValidating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {t.common.loading}
                    </>
                  ) : (
                    t.bots.validateAndContinue
                  )}
                </Button>
              </div>
            </div>

            {validationError && (
              <div className="col-start-2 col-span-3 mt-4">
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800/30">
                  {validationError}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {(step === 'trading' || isEditing) && balances.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{t.bots.accountBalances}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances.map((balance) => (
                <div 
                  key={balance.asset}
                  className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                      {balance.asset}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t.trading.available}:</span>
                      <span className="font-medium">{parseFloat(balance.free).toFixed(8)}</span>
                    </div>
                    {parseFloat(balance.locked) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t.trading.locked}:</span>
                        <span className="font-medium">{parseFloat(balance.locked).toFixed(8)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{pageTitle}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  {t.bots.botName}
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="col-span-3"
                  placeholder={t.bots.botNamePlaceholder}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  {t.trading.quoteAsset}
                </Label>
                <div className="col-span-3">
                  <select
                    value={quoteAsset}
                    onChange={(e) => setQuoteAsset(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background text-foreground dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                  >
                    {quoteAssets.map(quote => (
                      <option key={quote} value={quote}>{quote}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  {t.bots.tradingPair}
                </Label>
                <div className="col-span-3">
                  <SimplePairSelector
                    onSelect={handlePairSelect}
                    quoteAsset={quoteAsset}
                    pairs={pairs}
                    initialValue={formData.tradingPair}
                  />
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4">TradingView Strategy</h4>
                
                <div className="grid grid-cols-4 items-center gap-4 mb-6">
                  <Label className="text-right font-medium text-indigo-700 dark:text-indigo-300">
                    {t.bots.alertName}
                  </Label>
                  <div className="col-span-3 relative">
                    <Input
                      className="pr-20"
                      placeholder={t.bots.alertNamePlaceholder}
                      value={alertName}
                      onChange={(e) => setAlertName(e.target.value)}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <CopyButton text={alertName} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4 mb-6">
                  <Label className="text-right font-medium text-indigo-700 dark:text-indigo-300">
                    Tamanho da Posição
                  </Label>
                  <div className="col-span-3">
                    <select
                      value={positionSize}
                      onChange={(e) => setPositionSize(e.target.value as '100' | '50' | '25' | 'strategy')}
                      className="w-full p-2 border rounded-md bg-background text-foreground dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                    >
                      <option value="100">100% da posição</option>
                      <option value="50">50% da posição</option>
                      <option value="25">25% da posição</option>
                      <option value="strategy">Deixe a estratégia decidir</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute right-2 top-2">
                      <CopyButton text={getJsonTemplate(positionSize)} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <pre className="text-sm overflow-x-auto text-indigo-700 dark:text-indigo-300">
{getJsonTemplate(positionSize)}
                      </pre>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium text-yellow-600 dark:text-yellow-400">
                      Para o TradingView, você precisa pelo menos do plano Essential para poder criar alertas e usar Webhooks.
                    </p>
                    <p>Siga os passos abaixo para configurar:</p>
                    <ol className="list-decimal list-inside space-y-2 ml-2">
                      <li>No TradingView, abra o Strategy Tester e clique no ícone de Alerta</li>
                      <li>Copie e cole o código JSON acima no campo de mensagem do Alerta</li>
                      <li>Na aba "Notifications", ative o Webhook URL</li>
                      <li>Cole o URL do Webhook mostrado acima</li>
                      <li>Clique em "Create" para finalizar</li>
                    </ol>
                    <p className="mt-2">Pronto! Seu bot agora está configurado para receber sinais do TradingView.</p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 mt-6">
                <h4 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4">{t.bots.webhookEndpointTitle}</h4>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{t.bots.webhookUrl}</span>
                      <CopyButton text={`https://api.example.com/webhook`} />
                    </div>
                    <code className="text-sm break-all">
                      https://api.example.com/webhook
                    </code>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-4 mb-6">
                    <p>
                      Envie uma requisição POST com o JSON de Compra ou Venda para a URL do Webhook mostrada acima. Certifique-se de adicionar o IP do seu servidor à lista de permissões do bot (abaixo), caso contrário o sinal "não passará" 🤪
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-green-600 dark:text-green-400">Exemplo de Compra</span>
                        <CopyButton 
                          text={JSON.stringify({
                            action: "buy",
                            ticker: formData.tradingPair || "BTCUSDT",
                            order_size: positionSize === 'strategy' ? '{{strategy.order.contracts}}' : `${positionSize}%`,
                            position_size: "1",
                            schema: "2",
                            timestamp: getCurrentTimestamp(),
                            public_id: formData.public_id || "YOUR_BOT_PUBLIC_ID"
                          }, null, 2)} 
                        />
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <pre className="text-sm overflow-x-auto text-green-700 dark:text-green-300">
{JSON.stringify({
  action: "buy",
  ticker: formData.tradingPair || "BTCUSDT",
  order_size: positionSize === 'strategy' ? '{{strategy.order.contracts}}' : `${positionSize}%`,
  position_size: "1",
  schema: "2",
  timestamp: getCurrentTimestamp(),
  public_id: formData.public_id || "YOUR_BOT_PUBLIC_ID"
}, null, 2)}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-red-600 dark:text-red-400">Exemplo de Venda</span>
                        <CopyButton 
                          text={JSON.stringify({
                            action: "sell",
                            ticker: formData.tradingPair || "BTCUSDT",
                            order_size: positionSize === 'strategy' ? '{{strategy.order.contracts}}' : `${positionSize}%`,
                            position_size: "0",
                            schema: "2",
                            timestamp: getCurrentTimestamp(),
                            public_id: formData.public_id || "YOUR_BOT_PUBLIC_ID"
                          }, null, 2)} 
                        />
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-800">
                        <pre className="text-sm overflow-x-auto text-red-700 dark:text-red-300">
{JSON.stringify({
  action: "sell",
  ticker: formData.tradingPair || "BTCUSDT",
  order_size: positionSize === 'strategy' ? '{{strategy.order.contracts}}' : `${positionSize}%`,
  position_size: "0",
  schema: "2",
  timestamp: getCurrentTimestamp(),
  public_id: formData.public_id || "YOUR_BOT_PUBLIC_ID"
}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      Secret Key
                    </Label>
                    <div className="col-span-3 space-y-2">
                      <Input
                        type="password"
                        value={webhookConfig.secretKey}
                        onChange={(e) => setWebhookConfig(prev => ({ ...prev, secretKey: e.target.value }))}
                        placeholder="Chave secreta para autenticar as requisições"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.bots.webhookSecretKeyHelp}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      IPs Permitidos
                    </Label>
                    <div className="col-span-3 space-y-2">
                      <Input
                        value={webhookConfig.allowedIPs}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setWebhookConfig(prev => ({ ...prev, allowedIPs: newValue }));
                          
                          // Validar IPs em tempo real
                          if (newValue.trim()) {
                            const validation = validateIPList(newValue);
                            if (!validation.isValid) {
                              setIpValidationError(`IPs inválidos encontrados: ${validation.invalidIPs.join(', ')}`);
                            } else {
                              setIpValidationError(null);
                            }
                          } else {
                            setIpValidationError(null);
                          }
                        }}
                        className={ipValidationError ? 'border-red-500 dark:border-red-400' : ''}
                        placeholder="Lista de IPs separados por vírgula (ex: 1.2.3.4, 5.6.7.8)"
                      />
                      {ipValidationError ? (
                        <p className="text-sm text-red-500 dark:text-red-400">
                          {ipValidationError}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t.bots.webhookAllowedIPsHelp}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Formatos aceitos: IPv4 (ex: 192.168.0.1), IPv6 (ex: 2001:db8::1), localhost (::1 ou 127.0.0.1)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      Máx. Ordens/Minuto
                    </Label>
                    <div className="col-span-3 space-y-2">
                      <Input
                        type="number"
                        value={webhookConfig.maxOrdersPerMinute}
                        onChange={(e) => setWebhookConfig(prev => ({ ...prev, maxOrdersPerMinute: parseInt(e.target.value) }))}
                        min="1"
                        max="600"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.bots.webhookMaxOrdersHelp}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              onClick={() => navigate('/bots')}
              className="min-w-[100px] transition-all bg-white hover:bg-gray-100 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600"
            >
              {isEditing ? t.common.cancel : t.common.back}
            </Button>
            <Button
              onClick={handleSaveBot}
              disabled={!formData.name || !formData.tradingPair || isSaving}
              className={`min-w-[100px] transition-all relative ${
                isSaving 
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-gradient dark:from-indigo-600 dark:via-purple-600 dark:to-indigo-600' 
                  : 'bg-indigo-600 dark:bg-indigo-500'
              } text-white`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t.common.loading}
                </>
              ) : (
                isEditing ? t.common.save : t.common.create
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 
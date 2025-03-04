import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { validateMexcApiKeys } from '../lib/mexcService';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { SimplePairSelector } from '../components/SimplePairSelector';
import { Label, Input, Button } from '../components/ui';
import { ExchangeLogo } from '../components/ExchangeLogo';
import { getAvailablePairs } from '../lib/mexcService';
import { validateIPList } from '../lib/utils/validation';
import { toast } from 'sonner';
import axios from 'axios';
// Definição das exchanges suportadas
const EXCHANGES = [
    {
        name: 'MEXC',
        logo: 'MEXC',
        credentialFields: [
            { name: 'API Key', key: 'apiKey', type: 'text', placeholder: 'Sua API Key da MEXC' },
            { name: 'Secret Key', key: 'secretKey', type: 'password', placeholder: 'Sua Secret Key da MEXC' }
        ]
    }
];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const DEFAULT_EXCHANGE = 'MEXC';
function isValidExchange(exchange) {
    return ['MEXC', 'BINANCE', 'KUCOIN', 'BYBIT', 'COINBASE', 'KRAKEN'].includes(exchange);
}
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
    const [formData, setFormData] = React.useState({
        name: '',
        tradingPair: '',
        botId: '',
        public_id: ''
    });
    const [selectedExchange, setSelectedExchange] = React.useState(DEFAULT_EXCHANGE);
    const [credentials, setCredentials] = React.useState({});
    const [botData, setBotData] = React.useState(null);
    const [isValidating, setIsValidating] = React.useState(false);
    const [validationError, setValidationError] = React.useState(null);
    const [balances, setBalances] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [webhookConfig, setWebhookConfig] = React.useState({
        secretKey: '',
        allowedIPs: '',
        maxOrdersPerMinute: 60
    });
    const [quoteAsset, setQuoteAsset] = React.useState('');
    const [quoteAssets, setQuoteAssets] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [pairs, setPairs] = React.useState([]);
    const [step, setStep] = React.useState('exchange');
    console.log('🔄 Estado inicial do step:', { step, isEditing });
    const [alertName, setAlertName] = React.useState('');
    const [positionSize, setPositionSize] = React.useState('100');
    const [isSaving, setIsSaving] = React.useState(false);
    const [ipValidationError, setIpValidationError] = React.useState(null);
    // Atualiza o título e textos dos botões baseado no modo
    const pageTitle = isEditing ? t.bots.editBot : t.bots.createBot;
    const saveButtonText = isEditing ? t.common.save : t.common.create;
    // Efeito para carregar dados do bot em modo de edição
    React.useEffect(() => {
        const loadBotData = async () => {
            try {
                console.log('🔄 Iniciando carregamento do bot:', {
                    id,
                    isEditing,
                    pathname: location.pathname
                });
                const response = await axios.get(`${API_URL}/api/bots/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('session')}`
                    }
                });
                const botData = response.data;
                console.log('✅ Dados do bot carregados:', {
                    id: botData.id,
                    name: botData.name,
                    tradingPair: botData.tradingPair,
                    exchange: botData.exchange.name,
                    enabled: botData.enabled,
                    public_id: botData.public_id
                });
                // Atualizar o estado do formulário com os dados do bot
                setFormData({
                    name: botData.name,
                    tradingPair: botData.tradingPair,
                    botId: botData.id,
                    public_id: botData.public_id
                });
                // Atualizar os outros estados com os dados do bot
                setSelectedExchange(botData.exchange.name);
                if (botData.exchange.config?.credentials) {
                    setCredentials(botData.exchange.config.credentials);
                }
                setWebhookConfig({
                    secretKey: botData.webhook.secretKey || '',
                    allowedIPs: botData.webhook.allowedIPs?.join(', ') || '',
                    maxOrdersPerMinute: botData.webhook.maxOrdersPerMinute || 60
                });
                setQuoteAsset(botData.exchange.tradingInfo?.quoteAsset || 'USDT');
                setBotData(botData);
                setStep('trading');
                // Carregar pares e validar credenciais
                await loadPairs();
                const validationResult = await validateMexcApiKeys(botData.exchange.config.credentials.apiKey, botData.exchange.config.credentials.secretKey);
                if (validationResult.balances) {
                    setBalances(validationResult.balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0));
                }
                console.log('📝 Estado do formulário atualizado:', {
                    name: botData.name,
                    tradingPair: botData.tradingPair,
                    exchange: botData.exchange.name,
                    public_id: botData.public_id
                });
            }
            catch (error) {
                console.error('❌ Erro ao carregar dados do bot:', error);
                toast.error(t.errors.failedToLoadBots);
            }
        };
        if (isEditing && id) {
            loadBotData();
        }
    }, [id, isEditing, navigate]);
    React.useEffect(() => {
        if (selectedExchange) {
            const exchange = EXCHANGES.find(e => e.name === selectedExchange);
            if (exchange) {
                const initialCredentials = {};
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
            const result = await getAvailablePairs();
            if (result.success && result.pairs) {
                setPairs(result.pairs);
                const quotes = [...new Set(result.pairs.map(p => p.quoteAsset))].sort();
                setQuoteAssets(quotes);
                // Só atualizar o quoteAsset se não estivermos em modo de edição
                if (!isEditing) {
                    setQuoteAsset(quotes[0] || 'USDT');
                }
            }
            else {
                setError(result.error || t.errors.failedToLoadPairs);
            }
        }
        catch (err) {
            setError(t.errors.tradingPairsError);
            console.error(t.errors.tradingPairsError, err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCredentialChange = (key, value) => {
        setCredentials(prev => ({
            ...prev,
            [key]: value
        }));
    };
    const areCredentialsComplete = () => {
        const exchange = EXCHANGES.find(e => e.name === selectedExchange);
        if (!exchange)
            return false;
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
        }
        catch (error) {
            console.error('❌ Erro ao validar credenciais:', error);
            setValidationError(error instanceof Error ? error.message : t.errors.invalidCredentials);
        }
        finally {
            setIsValidating(false);
        }
    };
    const getJsonTemplate = (size) => {
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
    const handleExchangeSelect = (exchangeName) => {
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
            // Preparar payload
            const payload = {
                id: formData.botId,
                name: formData.name,
                tradingPair: formData.tradingPair,
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
                            baseAsset: formData.tradingPair.split('USDT')[0],
                            quoteAsset: 'USDT',
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
            }
            else {
                throw new Error(response.data.message || t.errors.generalError);
            }
        }
        catch (error) {
            console.error('❌ Erro ao salvar bot:', error);
            toast.error(error instanceof Error ? error.message : t.errors.generalError);
        }
        finally {
            setIsSaving(false);
            console.groupEnd();
        }
    };
    // Altere a função getCurrentTimestamp para retornar o formato ISO
    const getCurrentTimestamp = () => new Date().toISOString();
    if (loading && step !== 'exchange') {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx(RefreshCw, { className: "w-6 h-6 animate-spin" }) }));
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-indigo-100", children: isEditing ? t.bots.editBot : t.bots.createBot }), _jsx("p", { className: "text-gray-500 dark:text-indigo-300/70 mt-2", children: t.bots.editBotDescription })] }), _jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx("div", { className: `w-4 h-4 rounded-full ${step === 'exchange' ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-300 dark:bg-indigo-900/30'}` }), _jsx("div", { className: "h-0.5 flex-1 bg-gray-300 dark:bg-indigo-800" }), _jsx("div", { className: `w-4 h-4 rounded-full ${step === 'credentials' ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-300 dark:bg-indigo-900/30'}` }), _jsx("div", { className: "h-0.5 flex-1 bg-gray-300 dark:bg-indigo-800" }), _jsx("div", { className: `w-4 h-4 rounded-full ${step === 'trading' ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-300 dark:bg-indigo-900/30'}` })] }), _jsxs("div", { className: "flex justify-between text-sm text-gray-600 dark:text-indigo-300", children: [_jsx("span", { children: t.bots.selectExchange }), _jsx("span", { children: t.bots.validateAndContinue }), _jsx("span", { children: t.bots.tradingPair })] })] }), step === 'exchange' && (_jsxs("div", { className: "bg-white dark:bg-gray-800/50 dark:backdrop-blur p-6 rounded-lg shadow-sm border border-gray-100 dark:border-indigo-800/30", children: [_jsx("h2", { className: "text-xl font-semibold mb-4 text-gray-900 dark:text-indigo-100", children: t.bots.selectExchange }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: EXCHANGES.map((exchange) => (_jsxs("button", { type: "button", onClick: () => handleExchangeSelect(exchange.name), className: `p-4 border rounded-lg flex items-center gap-2 transition-colors ${selectedExchange === exchange.name
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50 dark:border-indigo-400'
                                : 'border-gray-200 dark:border-indigo-800/30 hover:bg-gray-50 dark:hover:bg-indigo-900/30'}`, children: [_jsx(ExchangeLogo, { exchangeName: exchange.logo }), _jsx("span", { className: "text-gray-900 dark:text-indigo-100", children: exchange.name })] }, exchange.name))) })] })), step === 'credentials' && selectedExchange && (_jsxs("div", { className: "bg-white dark:bg-gray-800/50 dark:backdrop-blur p-6 rounded-lg shadow-sm border border-gray-100 dark:border-indigo-800/30", children: [_jsxs("h2", { className: "text-xl font-semibold mb-4 text-gray-900 dark:text-indigo-100", children: [t.bots.selectExchange, " ", selectedExchange] }), _jsxs("div", { className: "space-y-4", children: [EXCHANGES.find(e => e.name === selectedExchange)?.credentialFields.map((field) => (_jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [_jsx(Label, { className: "text-right text-gray-700 dark:text-indigo-200", children: field.name }), _jsx(Input, { type: field.type, value: credentials[field.key] || '', onChange: (e) => handleCredentialChange(field.key, e.target.value), className: "col-span-3 bg-white dark:bg-gray-900/50 border-gray-200 dark:border-indigo-800/30", placeholder: field.placeholder })] }, field.key))), _jsx("div", { className: "grid grid-cols-4 gap-4 mt-6", children: _jsxs("div", { className: "col-start-2 col-span-3 flex gap-4", children: [_jsx(Button, { onClick: () => setStep('exchange'), className: "bg-white dark:bg-gray-800 text-gray-700 dark:text-indigo-200", children: t.common.back }), _jsx(Button, { onClick: handleValidateCredentials, disabled: isValidating || !areCredentialsComplete(), className: "bg-indigo-600 dark:bg-indigo-500 text-white", children: isValidating ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), t.common.loading] })) : (t.bots.validateAndContinue) })] }) }), validationError && (_jsx("div", { className: "col-start-2 col-span-3 mt-4", children: _jsx("div", { className: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800/30", children: validationError }) }))] })] })), step === 'trading' && balances.length > 0 && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: t.bots.accountBalances }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: balances.map((balance) => (_jsxs("div", { className: "p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800", children: [_jsx("div", { className: "flex justify-between items-start mb-2", children: _jsx("span", { className: "text-lg font-semibold text-indigo-600 dark:text-indigo-400", children: balance.asset }) }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { className: "text-gray-600 dark:text-gray-400", children: [t.trading.available, ":"] }), _jsx("span", { className: "font-medium", children: parseFloat(balance.free).toFixed(8) })] }), parseFloat(balance.locked) > 0 && (_jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { className: "text-gray-600 dark:text-gray-400", children: [t.trading.locked, ":"] }), _jsx("span", { className: "font-medium", children: parseFloat(balance.locked).toFixed(8) })] }))] })] }, balance.asset))) })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: pageTitle }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [_jsx(Label, { className: "text-right", children: t.bots.botName }), _jsx(Input, { value: formData.name, onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })), className: "col-span-3", placeholder: t.bots.botNamePlaceholder })] }), _jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [_jsx(Label, { className: "text-right", children: t.trading.quoteAsset }), _jsx("div", { className: "col-span-3", children: _jsx("select", { value: quoteAsset, onChange: (e) => setQuoteAsset(e.target.value), className: "w-full p-2 border rounded-md bg-background text-foreground dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700", children: quoteAssets.map(quote => (_jsx("option", { value: quote, children: quote }, quote))) }) })] }), _jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [_jsx(Label, { className: "text-right", children: t.bots.tradingPair }), _jsx("div", { className: "col-span-3", children: _jsx(SimplePairSelector, { onSelect: (pair) => setFormData(prev => ({ ...prev, tradingPair: pair.symbol })), quoteAsset: quoteAsset, pairs: pairs.filter(p => p.quoteAsset === quoteAsset), initialValue: isEditing && botData?.tradingPair ? botData.tradingPair : undefined }) })] }), _jsxs("div", { className: "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 mb-8", children: [_jsx("h4", { className: "text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4", children: "TradingView Strategy" }), _jsxs("div", { className: "grid grid-cols-4 items-center gap-4 mb-6", children: [_jsx(Label, { className: "text-right font-medium text-indigo-700 dark:text-indigo-300", children: t.bots.alertName }), _jsxs("div", { className: "col-span-3 relative", children: [_jsx(Input, { className: "pr-20", placeholder: t.bots.alertNamePlaceholder, value: alertName, onChange: (e) => setAlertName(e.target.value) }), _jsx("div", { className: "absolute right-2 top-1/2 -translate-y-1/2", children: _jsx(Button, { variant: "ghost", size: "sm", className: "h-7 px-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300", onClick: () => {
                                                                        navigator.clipboard.writeText(alertName);
                                                                    }, children: "Copiar" }) })] })] }), _jsxs("div", { className: "grid grid-cols-4 items-center gap-4 mb-6", children: [_jsx(Label, { className: "text-right font-medium text-indigo-700 dark:text-indigo-300", children: "Tamanho da Posi\u00E7\u00E3o" }), _jsx("div", { className: "col-span-3", children: _jsxs("select", { value: positionSize, onChange: (e) => setPositionSize(e.target.value), className: "w-full p-2 border rounded-md bg-background text-foreground dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700", children: [_jsx("option", { value: "100", children: "100% da posi\u00E7\u00E3o" }), _jsx("option", { value: "50", children: "50% da posi\u00E7\u00E3o" }), _jsx("option", { value: "25", children: "25% da posi\u00E7\u00E3o" }), _jsx("option", { value: "strategy", children: "Deixe a estrat\u00E9gia decidir" })] }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute right-2 top-2", children: _jsx(Button, { variant: "ghost", size: "sm", className: "h-8 px-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300", onClick: () => {
                                                                        navigator.clipboard.writeText(getJsonTemplate(positionSize));
                                                                    }, children: "Copiar" }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800", children: _jsx("pre", { className: "text-sm overflow-x-auto text-indigo-700 dark:text-indigo-300", children: getJsonTemplate(positionSize) }) })] }), _jsxs("div", { className: "mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400", children: [_jsx("p", { className: "font-medium text-yellow-600 dark:text-yellow-400", children: "Para o TradingView, voc\u00EA precisa pelo menos do plano Essential para poder criar alertas e usar Webhooks." }), _jsx("p", { children: "Siga os passos abaixo para configurar:" }), _jsxs("ol", { className: "list-decimal list-inside space-y-2 ml-2", children: [_jsx("li", { children: "No TradingView, abra o Strategy Tester e clique no \u00EDcone de Alerta" }), _jsx("li", { children: "Copie e cole o c\u00F3digo JSON acima no campo de mensagem do Alerta" }), _jsx("li", { children: "Na aba \"Notifications\", ative o Webhook URL" }), _jsx("li", { children: "Cole o URL do Webhook mostrado acima" }), _jsx("li", { children: "Clique em \"Create\" para finalizar" })] }), _jsx("p", { className: "mt-2", children: "Pronto! Seu bot agora est\u00E1 configurado para receber sinais do TradingView." })] })] })] }), _jsxs("div", { className: "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 mt-6", children: [_jsx("h4", { className: "text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4", children: t.bots.webhookEndpointTitle }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "font-medium", children: t.bots.webhookUrl }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-8 px-2", onClick: () => {
                                                                            navigator.clipboard.writeText(`https://api.example.com/webhook/${formData.public_id}`);
                                                                        }, children: "Copiar" })] }), _jsxs("code", { className: "text-sm break-all", children: ["https://api.example.com/webhook/", formData.public_id] })] }), _jsx("div", { className: "text-sm text-gray-600 dark:text-gray-400 mt-4 mb-6", children: _jsx("p", { children: "Envie uma requisi\u00E7\u00E3o POST com o JSON de Compra ou Venda para a URL do Webhook mostrada acima. Certifique-se de adicionar o IP do seu servidor \u00E0 lista de permiss\u00F5es do bot (abaixo), caso contr\u00E1rio o sinal \"n\u00E3o passar\u00E1\" \uD83E\uDD2A" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "font-medium text-green-600 dark:text-green-400", children: "Exemplo de Compra" }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-8 px-2", onClick: () => {
                                                                                    const buyExample = {
                                                                                        action: "buy",
                                                                                        ticker: formData.tradingPair || "BTCUSDT",
                                                                                        order_size: positionSize === 'strategy' ? '{{strategy.order.contracts}}' : `${positionSize}%`,
                                                                                        position_size: "1",
                                                                                        schema: "2",
                                                                                        timestamp: getCurrentTimestamp(),
                                                                                        public_id: formData.public_id || "YOUR_BOT_PUBLIC_ID"
                                                                                    };
                                                                                    navigator.clipboard.writeText(JSON.stringify(buyExample, null, 2));
                                                                                }, children: "Copiar" })] }), _jsx("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-800", children: _jsx("pre", { className: "text-sm overflow-x-auto text-green-700 dark:text-green-300", children: JSON.stringify({
                                                                                action: "buy",
                                                                                ticker: formData.tradingPair || "BTCUSDT",
                                                                                order_size: positionSize === 'strategy' ? '{{strategy.order.contracts}}' : `${positionSize}%`,
                                                                                position_size: "1",
                                                                                schema: "2",
                                                                                timestamp: getCurrentTimestamp(),
                                                                                public_id: formData.public_id || "YOUR_BOT_PUBLIC_ID"
                                                                            }, null, 2) }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "font-medium text-red-600 dark:text-red-400", children: "Exemplo de Venda" }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-8 px-2", onClick: () => {
                                                                                    const sellExample = {
                                                                                        action: "sell",
                                                                                        ticker: formData.tradingPair || "BTCUSDT",
                                                                                        order_size: positionSize === 'strategy' ? '{{strategy.order.contracts}}' : `${positionSize}%`,
                                                                                        position_size: "0",
                                                                                        schema: "2",
                                                                                        timestamp: getCurrentTimestamp(),
                                                                                        public_id: formData.public_id || "YOUR_BOT_PUBLIC_ID"
                                                                                    };
                                                                                    navigator.clipboard.writeText(JSON.stringify(sellExample, null, 2));
                                                                                }, children: "Copiar" })] }), _jsx("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-800", children: _jsx("pre", { className: "text-sm overflow-x-auto text-red-700 dark:text-red-300", children: JSON.stringify({
                                                                                action: "sell",
                                                                                ticker: formData.tradingPair || "BTCUSDT",
                                                                                order_size: positionSize === 'strategy' ? '{{strategy.order.contracts}}' : `${positionSize}%`,
                                                                                position_size: "0",
                                                                                schema: "2",
                                                                                timestamp: getCurrentTimestamp(),
                                                                                public_id: formData.public_id || "YOUR_BOT_PUBLIC_ID"
                                                                            }, null, 2) }) })] })] }), _jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [_jsx(Label, { className: "text-right", children: "Secret Key" }), _jsxs("div", { className: "col-span-3 space-y-2", children: [_jsx(Input, { type: "password", value: webhookConfig.secretKey, onChange: (e) => setWebhookConfig(prev => ({ ...prev, secretKey: e.target.value })), placeholder: "Chave secreta para autenticar as requisi\u00E7\u00F5es" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: t.bots.webhookSecretKeyHelp })] })] }), _jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [_jsx(Label, { className: "text-right", children: "IPs Permitidos" }), _jsxs("div", { className: "col-span-3 space-y-2", children: [_jsx(Input, { value: webhookConfig.allowedIPs, onChange: (e) => {
                                                                            const newValue = e.target.value;
                                                                            setWebhookConfig(prev => ({ ...prev, allowedIPs: newValue }));
                                                                            // Validar IPs em tempo real
                                                                            if (newValue.trim()) {
                                                                                const validation = validateIPList(newValue);
                                                                                if (!validation.isValid) {
                                                                                    setIpValidationError(`IPs inválidos encontrados: ${validation.invalidIPs.join(', ')}`);
                                                                                }
                                                                                else {
                                                                                    setIpValidationError(null);
                                                                                }
                                                                            }
                                                                            else {
                                                                                setIpValidationError(null);
                                                                            }
                                                                        }, className: ipValidationError ? 'border-red-500 dark:border-red-400' : '', placeholder: "Lista de IPs separados por v\u00EDrgula (ex: 1.2.3.4, 5.6.7.8)" }), ipValidationError ? (_jsx("p", { className: "text-sm text-red-500 dark:text-red-400", children: ipValidationError })) : (_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: t.bots.webhookAllowedIPsHelp })), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Formatos aceitos: IPv4 (ex: 192.168.0.1), IPv6 (ex: 2001:db8::1), localhost (::1 ou 127.0.0.1)" })] })] }), _jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [_jsx(Label, { className: "text-right", children: "M\u00E1x. Ordens/Minuto" }), _jsxs("div", { className: "col-span-3 space-y-2", children: [_jsx(Input, { type: "number", value: webhookConfig.maxOrdersPerMinute, onChange: (e) => setWebhookConfig(prev => ({ ...prev, maxOrdersPerMinute: parseInt(e.target.value) })), min: "1", max: "600" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: t.bots.webhookMaxOrdersHelp })] })] })] })] })] })] }), _jsxs("div", { className: "flex justify-end gap-4 mt-6", children: [_jsx(Button, { onClick: () => navigate('/bots'), className: "min-w-[100px] transition-all bg-white hover:bg-gray-100 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600", children: isEditing ? t.common.cancel : t.common.back }), _jsx(Button, { onClick: handleSaveBot, disabled: !formData.name || !formData.tradingPair || isSaving, className: "min-w-[100px] transition-all relative bg-indigo-600 dark:bg-indigo-500 text-white", children: isSaving ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), t.common.loading] })) : (isEditing ? t.common.save : t.common.create) })] })] }))] }));
}

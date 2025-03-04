import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, Input } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { validateMexcApiKeys } from '../lib/mexcService';
import { Activity, RefreshCw, Search, Bot as BotIcon } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;
const COLORS = [
    '#3498db', // azul
    '#2ecc71', // verde
    '#f1c40f', // amarelo
    '#e74c3c', // vermelho
    '#9b59b6', // roxo
    '#1abc9c', // turquesa
];
export function Overview() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [botBalances, setBotBalances] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const fetchBots = async (showLoadingState = false) => {
        try {
            const token = localStorage.getItem('session');
            if (!token) {
                navigate('/login');
                return;
            }
            if (showLoadingState) {
                setIsRefreshing(true);
            }
            const response = await fetch(`${API_URL}/api/bots`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(t.errors.failedToLoadBots);
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                const processedBots = data.map(bot => ({
                    ...bot,
                    enabled: Boolean(bot.enabled)
                }));
                setBots(prevBots => {
                    const hasChanges = JSON.stringify(prevBots) !== JSON.stringify(processedBots);
                    return hasChanges ? processedBots : prevBots;
                });
            }
        }
        catch (error) {
            console.error('❌ Erro ao carregar bots:', error);
            setError(error instanceof Error ? error.message : t.errors.generalError);
        }
        finally {
            setLoading(false);
            if (showLoadingState) {
                setIsRefreshing(false);
            }
        }
    };
    // Atualização inicial e intervalo mais curto
    useEffect(() => {
        fetchBots();
        const interval = setInterval(() => fetchBots(false), 5000); // Atualiza a cada 5 segundos
        return () => clearInterval(interval);
    }, []);
    const handleRefresh = () => {
        fetchBots(true);
        loadAllBalances(true);
    };
    const activeBots = bots.filter(bot => {
        const isEnabled = Boolean(bot.enabled);
        console.log(`Bot ${bot.name}: enabled = ${isEnabled} (original: ${bot.enabled}, tipo: ${typeof bot.enabled})`);
        return isEnabled === true;
    });
    const totalBots = bots.length;
    const filteredBots = activeBots.filter(bot => {
        const searchLower = searchTerm.toLowerCase();
        return (bot.name.toLowerCase().includes(searchLower) ||
            bot.tradingPair.toLowerCase().includes(searchLower) ||
            bot.exchange.name.toLowerCase().includes(searchLower) ||
            bot.public_id.toLowerCase().includes(searchLower));
    });
    useEffect(() => {
        loadAllBalances();
    }, [bots]);
    const loadAllBalances = async (showLoadingState = false) => {
        try {
            if (showLoadingState) {
                setIsRefreshing(true);
            }
            const promises = activeBots.map(async (bot) => {
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
                }
                catch (error) {
                    return {
                        id: bot.id,
                        balances: [],
                        loading: false,
                        error: error instanceof Error ? error.message : t.errors.errorLoadingBalances
                    };
                }
            });
            const results = await Promise.all(promises);
            const newBalancesData = {};
            results.forEach(result => {
                newBalancesData[result.id] = {
                    balances: result.balances || [],
                    loading: false,
                    error: result.error
                };
            });
            setBotBalances(prevBalances => {
                const hasChanges = JSON.stringify(prevBalances) !== JSON.stringify(newBalancesData);
                return hasChanges ? newBalancesData : prevBalances;
            });
        }
        catch (error) {
            console.error('❌ Erro ao carregar saldos:', error);
        }
        finally {
            if (showLoadingState) {
                setIsRefreshing(false);
            }
        }
    };
    const formatBalance = (value) => {
        const num = parseFloat(value);
        return num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8
        });
    };
    const calculateTotal = (balances) => {
        return balances.reduce((acc, balance) => {
            const total = parseFloat(balance.free) + parseFloat(balance.locked);
            return acc + total;
        }, 0);
    };
    const calculateTotalAllBots = () => {
        const totalByAsset = {};
        filteredBots.forEach(bot => {
            const botBalance = botBalances[bot.id];
            if (botBalance?.balances) {
                botBalance.balances.forEach(balance => {
                    const total = parseFloat(balance.free) + parseFloat(balance.locked);
                    if (total > 0) {
                        if (totalByAsset[balance.asset]) {
                            totalByAsset[balance.asset] += total;
                        }
                        else {
                            totalByAsset[balance.asset] = total;
                        }
                    }
                });
            }
        });
        return totalByAsset;
    };
    const prepareTotalChartData = () => {
        const totals = calculateTotalAllBots();
        const data = Object.entries(totals).map(([asset, value]) => ({
            name: asset,
            value,
            percentage: (value / Object.values(totals).reduce((a, b) => a + b, 0) * 100).toFixed(2)
        }));
        return data.sort((a, b) => b.value - a.value);
    };
    const prepareChartData = (balances) => {
        const total = calculateTotal(balances);
        return balances
            .map(balance => ({
            name: balance.asset,
            value: parseFloat(balance.free) + parseFloat(balance.locked),
            percentage: ((parseFloat(balance.free) + parseFloat(balance.locked)) / total * 100).toFixed(2)
        }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Limita a 5 moedas para melhor visualização
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[200px]", children: _jsx("div", { className: "text-lg text-gray-600 dark:text-gray-300", children: t.common.loading }) }));
    }
    if (error) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[200px]", children: _jsx("div", { className: "text-lg text-red-600 dark:text-red-400", children: error }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-900 dark:text-white", children: t.dashboard.overview }), _jsxs("button", { onClick: handleRefresh, disabled: isRefreshing, className: "flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}` }), isRefreshing ? t.common.loading : t.dashboard.refreshBalances] })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [_jsxs(Card, { className: "lg:col-span-2", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: t.dashboard.totalBalanceByAsset }), _jsx(Activity, { className: "h-4 w-4 text-muted-foreground" })] }), _jsx(CardContent, { children: Object.entries(calculateTotalAllBots()).length > 0 ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "h-3 w-full flex rounded-full overflow-hidden mb-4", children: prepareTotalChartData().map((entry, index) => (_jsx("div", { className: "h-full transition-all duration-300", style: {
                                                    width: `${entry.percentage}%`,
                                                    backgroundColor: COLORS[index % COLORS.length]
                                                }, title: `${entry.name}: ${entry.percentage}%` }, entry.name))) }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2 text-sm", children: prepareTotalChartData().map((entry, index) => (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 rounded-full", style: { backgroundColor: COLORS[index % COLORS.length] } }), _jsx("span", { className: "font-medium", children: entry.name }), _jsxs("span", { className: "text-muted-foreground", children: [formatBalance(entry.value.toString()), " (", entry.percentage, "%)"] })] }, entry.name))) })] })) : (_jsx("div", { className: "text-center text-muted-foreground", children: t.dashboard.noBalancesAvailable })) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: t.dashboard.activeBots }), _jsx(BotIcon, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: activeBots.length }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [t.dashboard.totalBots, ": ", totalBots] })] })] })] }), activeBots.length > 0 && (_jsxs("div", { className: "mt-8", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: t.dashboard.activeBots }), _jsxs("div", { className: "relative w-64", children: [_jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: t.dashboard.searchPlaceholder, value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-8" })] })] }), filteredBots.length === 0 ? (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: t.dashboard.noBotsFound })) : (_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: filteredBots.map(bot => {
                            const botBalance = botBalances[bot.id];
                            const relevantBalances = botBalance?.balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0).sort((a, b) => {
                                const totalA = parseFloat(a.free) + parseFloat(a.locked);
                                const totalB = parseFloat(b.free) + parseFloat(b.locked);
                                return totalB - totalA;
                            }).slice(0, 3);
                            const chartData = relevantBalances ? prepareChartData(relevantBalances) : [];
                            return (_jsxs(Card, { className: "bg-[#020817] border-indigo-800/30", children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-lg text-white", children: bot.name }), _jsxs("div", { className: "text-sm text-indigo-300/70", children: ["ID: ", bot.public_id] })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-indigo-300/70", children: "Par:" }), _jsx("div", { className: "text-white", children: bot.tradingPair })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "text-indigo-300/70", children: "Exchange:" }), _jsx("div", { className: "text-white", children: bot.exchange.name })] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-indigo-300 mb-2", children: t.bots.statistics }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-indigo-300/70", children: t.bots.totalTrades }), _jsx("div", { className: "text-white text-lg", children: bot.statistics?.totalTrades || 0 })] }), _jsxs("div", { children: [_jsx("div", { className: "text-indigo-300/70", children: t.bots.winRate }), _jsx("div", { className: "text-white text-lg", children: bot.statistics?.winRate || '0' })] }), _jsxs("div", { children: [_jsx("div", { className: "text-indigo-300/70", children: t.bots.profitLoss }), _jsx("div", { className: `text-lg ${bot.statistics?.profitLoss?.startsWith('-')
                                                                            ? 'text-red-500'
                                                                            : bot.statistics?.profitLoss === '0' || !bot.statistics?.profitLoss
                                                                                ? 'text-white'
                                                                                : 'text-emerald-500'}`, children: bot.statistics?.profitLoss || '0' })] })] })] }), _jsx("div", { children: _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-indigo-300/70", children: t.bots.createdAt }), _jsx("div", { className: "text-white", children: new Date(bot.createdAt).toLocaleString() })] }), _jsxs("div", { children: [_jsx("div", { className: "text-indigo-300/70", children: t.bots.updatedAt }), _jsx("div", { className: "text-white", children: new Date(bot.updatedAt).toLocaleString() })] })] }) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-indigo-300 mb-2", children: "Saldos" }), botBalance?.loading ? (_jsx("div", { className: "flex items-center justify-center py-2", children: _jsx(RefreshCw, { className: "h-4 w-4 animate-spin text-white" }) })) : botBalance?.error ? (_jsx("div", { className: "text-sm text-red-400", children: botBalance.error })) : relevantBalances && relevantBalances.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "space-y-2", children: relevantBalances.map(balance => (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-indigo-300", children: balance.asset }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-white", children: formatBalance(balance.free) }), parseFloat(balance.locked) > 0 && (_jsxs("div", { className: "text-xs text-indigo-300/70", children: [formatBalance(balance.locked), " ", t.trading.inOrder] }))] })] }, balance.asset))) }), chartData.length > 0 && (_jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "h-2 w-full flex rounded-full overflow-hidden", children: chartData.map((entry, index) => (_jsx("div", { className: "h-full transition-all duration-300", style: {
                                                                                width: `${entry.percentage}%`,
                                                                                backgroundColor: COLORS[index % COLORS.length]
                                                                            }, title: `${entry.name}: ${entry.percentage}%` }, entry.name))) }), _jsx("div", { className: "flex flex-wrap gap-2 text-xs mt-2", children: chartData.map((entry, index) => (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 rounded-full", style: { backgroundColor: COLORS[index % COLORS.length] } }), _jsxs("span", { className: "text-indigo-300", children: [entry.name, " (", entry.percentage, "%)"] })] }, entry.name))) })] }))] })) : (_jsx("div", { className: "text-sm text-indigo-300/70 text-center", children: t.dashboard.noBalancesAvailable }))] })] })] }, bot.id));
                        }) }))] }))] }));
}

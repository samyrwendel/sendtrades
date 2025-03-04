import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import { validateMexcApiKeys } from '../lib/mexcService';
import { calculateOrderQuantity } from '../lib/orderCalculator';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
export default function TestCalculo() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [balances, setBalances] = useState([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [bot, setBot] = useState(null);
    const [calculations, setCalculations] = useState([]);
    const [selectedPair, setSelectedPair] = useState('BTCUSDT');
    const [currentPrice, setCurrentPrice] = useState('0');
    useEffect(() => {
        loadBot();
    }, []);
    async function loadBot() {
        try {
            const token = localStorage.getItem('session');
            if (!token) {
                setError('Sessão expirada');
                return;
            }
            const response = await fetch(`${API_URL}/api/bots`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Falha ao carregar bots');
            }
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                setBot(data[0]); // Pega o primeiro bot
                await loadBalances(data[0]);
            }
            else {
                setError('Nenhum bot encontrado');
            }
        }
        catch (error) {
            console.error('Erro ao carregar bot:', error);
            setError(error instanceof Error ? error.message : 'Erro ao carregar bot');
        }
    }
    async function loadBalances(currentBot) {
        try {
            setLoading(true);
            setError(null);
            const apiKey = currentBot.exchange?.config?.credentials?.apiKey;
            const secretKey = currentBot.exchange?.config?.credentials?.secretKey;
            if (!apiKey || !secretKey) {
                throw new Error('Credenciais não configuradas');
            }
            console.log('Validando credenciais...');
            const result = await validateMexcApiKeys(apiKey, secretKey);
            if (!result.isValid || !result.balances) {
                throw new Error(result.error || 'Falha ao validar credenciais');
            }
            setBalances(result.balances);
            // Calcular total em USDT
            let total = 0;
            for (const balance of result.balances) {
                if (balance.asset === 'USDT') {
                    total += parseFloat(balance.free) + parseFloat(balance.locked);
                }
                else {
                    try {
                        const { data } = await axios.get(`/api/v3/ticker/price?symbol=${balance.asset}USDT`);
                        if (data.price) {
                            const value = (parseFloat(balance.free) + parseFloat(balance.locked)) * parseFloat(data.price);
                            total += value;
                        }
                    }
                    catch (e) {
                        console.warn(`Não foi possível obter preço para ${balance.asset}USDT`);
                    }
                }
            }
            setTotalBalance(total);
            // Carregar preço atual do par selecionado
            try {
                const { data } = await axios.get(`/api/v3/ticker/price?symbol=${selectedPair}`);
                if (data.price) {
                    setCurrentPrice(data.price);
                }
            }
            catch (e) {
                console.error(`Erro ao obter preço de ${selectedPair}:`, e);
            }
            setLoading(false);
        }
        catch (error) {
            console.error('Erro ao carregar saldos:', error);
            setError(error instanceof Error ? error.message : 'Erro ao carregar saldos');
            setLoading(false);
        }
    }
    async function calculateOrders() {
        try {
            // Atualizar o preço atual antes de calcular
            const { data: priceData } = await axios.get(`/api/v3/ticker/price?symbol=${selectedPair}`);
            if (priceData.price) {
                setCurrentPrice(priceData.price);
            }
            const percentages = ['25%', '50%', '100%'];
            const results = [];
            for (const percentage of percentages) {
                try {
                    const calc = await calculateOrderQuantity(balances, percentage, selectedPair, priceData.price || currentPrice);
                    results.push({
                        percentage,
                        quantity: calc.quantity,
                        baseAmount: calc.baseAmount,
                        quoteAmount: calc.quoteAmount,
                        error: calc.error
                    });
                }
                catch (error) {
                    results.push({
                        percentage,
                        quantity: '0',
                        baseAmount: '0',
                        quoteAmount: '0',
                        error: error instanceof Error ? error.message : 'Erro ao calcular ordem'
                    });
                }
            }
            setCalculations(results);
        }
        catch (error) {
            console.error('Erro ao calcular ordens:', error);
            setError(error instanceof Error ? error.message : 'Erro ao calcular ordens');
        }
    }
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" }) }));
    }
    if (error) {
        return (_jsxs("div", { className: "p-4 bg-red-100 border border-red-400 text-red-700 rounded", children: [_jsx("h2", { className: "text-lg font-bold mb-2", children: "Erro" }), _jsx("p", { children: error }), _jsx("button", { onClick: () => bot ? loadBalances(bot) : loadBot(), className: "mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600", children: "Tentar Novamente" })] }));
    }
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Overview da Conta" }), _jsxs("div", { className: "text-3xl font-bold text-blue-600 dark:text-blue-400", children: ["$", totalBalance.toFixed(2), " USDT"] }), _jsxs("div", { className: "mt-4 flex gap-4", children: [_jsx("button", { onClick: () => bot ? loadBalances(bot) : loadBot(), className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", children: "Atualizar Saldos" }), _jsx("button", { onClick: calculateOrders, className: "px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600", children: "Calcular Ordens" })] })] }), currentPrice !== '0' && (_jsxs("div", { className: "mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg", children: [_jsx("h2", { className: "text-xl font-bold mb-2", children: "Pre\u00E7o Atual" }), _jsxs("div", { className: "text-2xl text-green-500", children: [selectedPair, ": $", parseFloat(currentPrice).toFixed(2), " USDT"] })] })), calculations.length > 0 && (_jsx("div", { className: "mb-8 grid grid-cols-1 md:grid-cols-3 gap-4", children: calculations.map((calc, index) => (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg", children: [_jsxs("h3", { className: "text-xl font-bold mb-4", children: [calc.percentage, " do Saldo"] }), calc.error ? (_jsx("div", { className: "text-red-500", children: calc.error })) : (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-300", children: "Quantidade" }), _jsx("span", { children: parseFloat(calc.quantity).toFixed(8) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-300", children: "Valor Base" }), _jsx("span", { children: parseFloat(calc.baseAmount).toFixed(8) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-300", children: "Valor USDT" }), _jsxs("span", { children: [parseFloat(calc.quoteAmount).toFixed(2), " USDT"] })] })] }))] }, index))) })), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: balances
                    .sort((a, b) => {
                    const aTotal = parseFloat(a.free) + parseFloat(a.locked);
                    const bTotal = parseFloat(b.free) + parseFloat(b.locked);
                    return bTotal - aTotal;
                })
                    .map((balance, index) => (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-xl font-bold", children: balance.asset }), _jsx("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: (parseFloat(balance.free) + parseFloat(balance.locked)).toFixed(8) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-300", children: "Dispon\u00EDvel" }), _jsx("span", { children: parseFloat(balance.free).toFixed(8) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-300", children: "Em Ordem" }), _jsx("span", { children: parseFloat(balance.locked).toFixed(8) })] })] })] }, index))) })] }));
}

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { getExchange } from '../lib/exchanges';
import { TradeModal } from './TradeModal';
export function SpotTrading({ credentials, exchangeName }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [balances, setBalances] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [tradeModal, setTradeModal] = useState({
        isOpen: false,
        type: 'buy',
        balance: '0',
        symbol: '',
        quoteBalance: '0',
        quoteCurrency: '',
    });
    const handleOpenModal = async () => {
        setIsLoading(true);
        setIsModalOpen(true);
        try {
            const exchange = getExchange(exchangeName);
            if (!exchange) {
                throw new Error('Exchange not found');
            }
            const balanceData = await exchange.getBalances(credentials);
            setBalances(balanceData);
        }
        catch (error) {
            console.error('Failed to fetch balances:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleTrade = (type, balance, symbol) => {
        // Find the quote currency balance (USDT, USDC, etc.)
        const quoteCurrency = 'USDT'; // You can make this dynamic based on the trading pair
        const quoteBalance = balances.find(b => b.asset === quoteCurrency)?.free || '0';
        setTradeModal({
            isOpen: true,
            type,
            balance,
            symbol,
            quoteBalance,
            quoteCurrency,
        });
    };
    const handleTradeSubmit = async (amount) => {
        try {
            const exchange = getExchange(exchangeName);
            if (!exchange) {
                throw new Error('Exchange not found');
            }
            const result = await exchange.executeTrade(credentials, {
                symbol: tradeModal.symbol,
                amount,
                type: tradeModal.type,
            });
            if (result.success) {
                // Refresh balances after successful trade
                const balanceData = await exchange.getBalances(credentials);
                setBalances(balanceData);
            }
        }
        catch (error) {
            console.error('Trade execution failed:', error);
        }
    };
    const formatBalance = (value) => {
        const num = parseFloat(value);
        return num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8
        });
    };
    const displayBalances = balances
        .filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
        .sort((a, b) => {
        const aTotal = parseFloat(a.free) + parseFloat(a.locked);
        const bTotal = parseFloat(b.free) + parseFloat(b.locked);
        return bTotal - aTotal;
    });
    return (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: handleOpenModal, className: "flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100", children: [_jsx(Wallet, { className: "w-5 h-5 mr-2" }), "Spot Trading"] }), isModalOpen && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 dark:text-white", children: "Spot Trading" }), _jsx("button", { onClick: () => setIsModalOpen(false), className: "text-gray-400 hover:text-gray-500 dark:hover:text-gray-300", children: "\u00D7" })] }), isLoading ? (_jsx("div", { className: "flex justify-center items-center h-40", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" }) })) : (_jsx("div", { className: "space-y-4", children: displayBalances.map((balance) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-600 dark:text-gray-300", children: balance.asset }), _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "text-gray-900 dark:text-white", children: formatBalance(balance.free) }), parseFloat(balance.locked) > 0 && (_jsxs("span", { className: "text-gray-500 dark:text-gray-400 ml-2", children: ["(", formatBalance(balance.locked), " locked)"] }))] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => handleTrade('buy', balance.free, balance.asset), className: "px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700", children: "Buy" }), _jsx("button", { onClick: () => handleTrade('sell', balance.free, balance.asset), className: "px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700", children: "Sell" })] })] }, balance.asset))) }))] }) })), _jsx(TradeModal, { isOpen: tradeModal.isOpen, onClose: () => setTradeModal(prev => ({ ...prev, isOpen: false })), type: tradeModal.type, balance: tradeModal.balance, symbol: tradeModal.symbol, quoteBalance: tradeModal.quoteBalance, quoteCurrency: tradeModal.quoteCurrency, onSubmit: handleTradeSubmit })] }));
}

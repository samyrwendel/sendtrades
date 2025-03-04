import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
export function TradeModal({ isOpen, onClose, type, balance, symbol, quoteBalance, quoteCurrency, onSubmit }) {
    const [amount, setAmount] = useState('');
    const maxAmount = type === 'buy' ? parseFloat(quoteBalance || '0') : parseFloat(balance);
    const handlePercentageClick = (percentage) => {
        const calculatedAmount = (maxAmount * percentage).toFixed(8);
        setAmount(calculatedAmount);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(amount);
        onClose();
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md", children: [_jsxs("h3", { className: "text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center", children: [type === 'buy' ? (_jsx(ArrowUp, { className: "w-6 h-6 text-green-500 mr-2" })) : (_jsx(ArrowDown, { className: "w-6 h-6 text-red-500 mr-2" })), type === 'buy' ? 'Buy' : 'Sell', " ", symbol] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: [symbol, " Balance:"] }), _jsxs("span", { className: "text-sm text-gray-900 dark:text-white", children: [parseFloat(balance).toFixed(8), " ", symbol] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: [quoteCurrency, " Balance:"] }), _jsxs("span", { className: "text-sm text-gray-900 dark:text-white", children: [parseFloat(quoteBalance || '0').toFixed(2), " ", quoteCurrency] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: type === 'buy' ? `Amount (${quoteCurrency})` : `Amount (${symbol})` }), _jsxs("div", { className: "flex space-x-2 mb-2", children: [_jsx("button", { type: "button", onClick: () => handlePercentageClick(0.25), className: "flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600", children: "25%" }), _jsx("button", { type: "button", onClick: () => handlePercentageClick(0.5), className: "flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600", children: "50%" }), _jsx("button", { type: "button", onClick: () => handlePercentageClick(1), className: "flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600", children: "100%" })] }), _jsx("input", { type: "number", step: "any", value: amount, onChange: (e) => setAmount(e.target.value), placeholder: `Enter amount in ${type === 'buy' ? quoteCurrency : symbol}`, className: "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" })] })] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700", children: "Cancel" }), _jsxs("button", { type: "submit", className: `px-4 py-2 text-sm font-medium text-white rounded-md ${type === 'buy'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'}`, children: [type === 'buy' ? 'Buy' : 'Sell', " ", symbol] })] })] })] }) }));
}

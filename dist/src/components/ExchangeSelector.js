import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { EXCHANGE_STATUS } from '../lib/exchanges/constants';
import { ExchangeLogo } from './ExchangeLogo';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Badge } from './ui/badge';
import { Sparkles, Clock } from 'lucide-react';
export function ExchangeSelector({ onSelect, selectedExchange }) {
    const { t } = useLanguage();
    // Lista de todas as exchanges em ordem de prioridade
    const allExchanges = Object.entries(EXCHANGE_STATUS).sort(([, a], [, b]) => {
        if (a.priority && !b.priority)
            return -1;
        if (!a.priority && b.priority)
            return 1;
        return a.name.localeCompare(b.name);
    });
    return (_jsx("div", { className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: allExchanges.map(([key, exchange]) => (_jsx("button", { onClick: () => exchange.implemented && onSelect(key), className: `
              relative p-6 border-2 rounded-xl flex items-center space-x-4 transition-all duration-200
              ${selectedExchange === key
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-gray-200 dark:border-gray-700'}
              ${exchange.implemented
                    ? 'hover:border-indigo-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    : 'opacity-70 cursor-not-allowed'}
              ${exchange.priority ? 'md:col-span-2' : ''}
            `, disabled: !exchange.implemented, children: _jsxs("div", { className: "flex items-center space-x-4 w-full", children: [_jsxs("div", { className: `relative ${!exchange.implemented ? 'grayscale' : ''}`, children: [_jsx(ExchangeLogo, { exchangeName: key, className: `
                    transform transition-transform duration-200
                    ${exchange.priority ? 'w-16 h-16' : 'w-12 h-12'}
                    ${exchange.implemented ? 'hover:scale-110' : ''}
                  ` }), !exchange.implemented && (_jsx("div", { className: "absolute inset-0 bg-gray-900/10 dark:bg-gray-900/30 rounded-full" }))] }), _jsxs("div", { className: "flex flex-col flex-grow", children: [_jsx("span", { className: `
                  font-bold
                  ${exchange.priority ? 'text-xl' : 'text-lg'}
                  ${exchange.implemented ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}
                `, children: exchange.name }), _jsx("div", { className: "flex items-center space-x-2 mt-1", children: exchange.implemented ? (_jsx(_Fragment, { children: exchange.inProgress ? (_jsxs(Badge, { variant: "warning", className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3" }), "Em Implementa\u00E7\u00E3o"] })) : (_jsxs(Badge, { variant: "success", className: "flex items-center gap-1", children: [_jsx(Sparkles, { className: "w-3 h-3" }), exchange.priority ? t.exchanges.recommended : t.exchanges.available] })) })) : (_jsx(Badge, { variant: "secondary", className: "text-sm", children: t.exchanges.comingSoon })) })] }), !exchange.implemented && (_jsx("div", { className: "absolute top-4 right-4", children: _jsx(Badge, { variant: "secondary", className: "text-xs", children: t.exchanges.comingSoon }) }))] }) }, key))) }) }));
}

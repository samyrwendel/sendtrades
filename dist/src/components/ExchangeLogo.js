import { jsx as _jsx } from "react/jsx-runtime";
import { EXCHANGE_LOGOS } from '../lib/exchanges/constants';
export function ExchangeLogo({ exchangeName, className = '' }) {
    // Classes base para o logo
    const baseClasses = 'object-contain transition-all duration-200';
    // Classes específicas baseadas na exchange
    const exchangeSpecificClasses = exchangeName === 'MEXC'
        ? 'w-16 h-16' // MEXC tem tamanho maior
        : 'w-8 h-8'; // Outras exchanges têm tamanho padrão
    return (_jsx("img", { src: EXCHANGE_LOGOS[exchangeName], alt: `${exchangeName} logo`, className: `${baseClasses} ${exchangeSpecificClasses} ${className}`, loading: exchangeName === 'MEXC' ? 'eager' : 'lazy' }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
export function SimplePairSelector({ onSelect, quoteAsset, pairs, initialValue }) {
    const { t } = useLanguage();
    const [selectedPair, setSelectedPair] = useState(initialValue || '');
    const handlePairChange = (event) => {
        const symbol = event.target.value;
        setSelectedPair(symbol);
        const pair = pairs.find(p => p.symbol === symbol);
        if (pair) {
            onSelect(pair);
        }
    };
    return (_jsxs("select", { value: selectedPair, onChange: handlePairChange, className: "w-full p-2 border rounded-md bg-background text-foreground dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700", children: [_jsx("option", { value: "", children: t.trading.selectPair }), pairs.map((pair) => (_jsxs("option", { value: pair.symbol, children: [pair.baseAsset, "/", pair.quoteAsset] }, pair.symbol)))] }));
}

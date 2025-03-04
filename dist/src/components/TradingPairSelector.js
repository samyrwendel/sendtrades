import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from 'react';
import { getAvailablePairs } from '../lib/mexcService';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui";
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
export function TradingPairSelector({ onSelect, selectedPair }) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [pairs, setPairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [quoteFilter, setQuoteFilter] = useState('USDT');
    const [selectedValue, setSelectedValue] = useState(selectedPair || '');
    const uniqueQuoteAssets = useMemo(() => {
        const quotes = [...new Set(pairs.map(p => p.quoteAsset))].sort();
        return quotes;
    }, [pairs]);
    useEffect(() => {
        loadPairs();
    }, []);
    useEffect(() => {
        if (selectedPair) {
            setSelectedValue(selectedPair);
        }
    }, [selectedPair]);
    const loadPairs = async () => {
        try {
            setLoading(true);
            const result = await getAvailablePairs();
            if (result.success && result.pairs) {
                console.log('Pares carregados:', result.pairs.length);
                setPairs(result.pairs);
            }
            else {
                setError(result.error || t.errors.failedToLoadPairs);
            }
        }
        catch (err) {
            setError(t.errors.tradingPairsError);
            console.error('Erro ao carregar pares:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const filteredPairs = useMemo(() => {
        console.log('Filtrando pares...');
        console.log('Search:', search);
        console.log('Quote Filter:', quoteFilter);
        const searchLower = search.toLowerCase().trim();
        return pairs
            .filter(pair => {
            const matchesQuote = pair.quoteAsset === quoteFilter;
            const matchesSearch = searchLower === '' ||
                pair.symbol.toLowerCase().includes(searchLower) ||
                pair.baseAsset.toLowerCase().includes(searchLower) ||
                pair.quoteAsset.toLowerCase().includes(searchLower);
            console.log(`Par ${pair.symbol}: Quote Match = ${matchesQuote}, Search Match = ${matchesSearch}`);
            return matchesQuote && matchesSearch;
        })
            .sort((a, b) => a.symbol.localeCompare(b.symbol));
    }, [pairs, quoteFilter, search]);
    const handlePairSelect = (value) => {
        console.log('Par selecionado:', value);
        const selectedPair = pairs.find(p => p.symbol === value);
        if (selectedPair) {
            console.log('Par encontrado:', selectedPair);
            setSelectedValue(value);
            onSelect(selectedPair);
            setOpen(false);
        }
    };
    if (loading)
        return _jsx("div", { className: "text-center p-4", children: t.common.loading });
    if (error)
        return _jsx("div", { className: "text-red-500 p-4", children: error });
    return (_jsxs("div", { className: "w-full space-y-4", children: [_jsxs("div", { className: "flex gap-2 items-center", children: [_jsxs("label", { className: "text-sm font-medium min-w-[100px]", children: [t.trading.quoteAsset, ":"] }), _jsx("select", { value: quoteFilter, onChange: (e) => setQuoteFilter(e.target.value), className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", children: uniqueQuoteAssets.map(quote => (_jsx("option", { value: quote, children: quote }, quote))) })] }), _jsxs("div", { className: "flex gap-2 items-center", children: [_jsxs("label", { className: "text-sm font-medium min-w-[100px]", children: [t.trading.pair, ":"] }), _jsxs(Popover, { open: open, onOpenChange: setOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", role: "combobox", "aria-expanded": open, className: "w-full justify-between", children: [selectedValue
                                            ? pairs.find((pair) => pair.symbol === selectedValue)?.symbol || t.trading.selectPair
                                            : t.trading.selectPair, _jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })] }) }), _jsx(PopoverContent, { className: "w-[400px] p-0", children: _jsxs(Command, { shouldFilter: false, children: [_jsx(CommandInput, { placeholder: t.trading.searchPair, value: search, onValueChange: setSearch }), _jsx(CommandEmpty, { children: t.trading.noPairsFound }), _jsx(CommandGroup, { className: "max-h-[300px] overflow-auto", children: filteredPairs.map((pair) => (_jsxs(CommandItem, { value: pair.symbol, onSelect: handlePairSelect, className: "cursor-pointer hover:bg-accent", children: [_jsx(Check, { className: cn("mr-2 h-4 w-4", selectedValue === pair.symbol ? "opacity-100" : "opacity-0") }), _jsxs("div", { className: "flex flex-col items-start", children: [_jsx("span", { className: "font-medium", children: pair.symbol }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [pair.baseAsset, "/", pair.quoteAsset] })] })] }, pair.symbol))) })] }) })] })] }), selectedValue && (_jsxs("div", { className: "mt-4 p-4 border rounded-lg", children: [_jsx("h3", { className: "font-medium mb-2", children: t.trading.pairInfo }), pairs.filter(p => p.symbol === selectedValue).map(pair => (_jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("p", { children: [t.trading.pair, ": ", pair.symbol] }), _jsxs("p", { children: [t.trading.base, ": ", pair.baseAsset] }), _jsxs("p", { children: [t.trading.quote, ": ", pair.quoteAsset] }), _jsxs("p", { children: [t.trading.basePrecision, ": ", pair.baseAssetPrecision] }), _jsxs("p", { children: [t.trading.quotePrecision, ": ", pair.quoteAssetPrecision] }), pair.filters.map((filter, index) => (_jsxs("div", { className: "text-xs text-gray-600", children: [filter.filterType, ": ", filter.minQty ? `${t.trading.min}: ${filter.minQty}` : '', " ", filter.maxQty ? `${t.trading.max}: ${filter.maxQty}` : '', " ", filter.stepSize ? `${t.trading.step}: ${filter.stepSize}` : ''] }, index)))] }, pair.symbol)))] }))] }));
}

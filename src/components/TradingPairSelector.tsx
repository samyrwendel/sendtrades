import React, { useEffect, useState, useMemo } from 'react';
import { getAvailablePairs } from '../lib/mexcService';
import { MexcSymbol } from '../lib/types';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui";
import { useLanguage } from '../lib/i18n/LanguageContext';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TradingPairSelectorProps {
  onSelect: (pair: MexcSymbol) => void;
  selectedPair?: string;
}

export function TradingPairSelector({ onSelect, selectedPair }: TradingPairSelectorProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [pairs, setPairs] = useState<MexcSymbol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [quoteFilter, setQuoteFilter] = useState<string>('USDT');
  const [selectedValue, setSelectedValue] = useState<string>(selectedPair || '');

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
      } else {
        setError(result.error || t.errors.failedToLoadPairs);
      }
    } catch (err) {
      setError(t.errors.tradingPairsError);
      console.error('Erro ao carregar pares:', err);
    } finally {
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

  const handlePairSelect = (value: string) => {
    console.log('Par selecionado:', value);
    const selectedPair = pairs.find(p => p.symbol === value);
    if (selectedPair) {
      console.log('Par encontrado:', selectedPair);
      setSelectedValue(value);
      onSelect(selectedPair);
      setOpen(false);
    }
  };

  if (loading) return <div className="text-center p-4">{t.common.loading}</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="w-full space-y-4">
      {/* Quote Asset Selector */}
      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium min-w-[100px]">{t.trading.quoteAsset}:</label>
        <select
          value={quoteFilter}
          onChange={(e) => setQuoteFilter(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uniqueQuoteAssets.map(quote => (
            <option key={quote} value={quote}>{quote}</option>
          ))}
        </select>
      </div>

      {/* Trading Pair Selector */}
      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium min-w-[100px]">{t.trading.pair}:</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedValue
                ? pairs.find((pair) => pair.symbol === selectedValue)?.symbol || t.trading.selectPair
                : t.trading.selectPair}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command shouldFilter={false}>
              <CommandInput 
                placeholder={t.trading.searchPair}
                value={search}
                onValueChange={setSearch}
              />
              <CommandEmpty>{t.trading.noPairsFound}</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {filteredPairs.map((pair) => (
                  <CommandItem
                    key={pair.symbol}
                    value={pair.symbol}
                    onSelect={handlePairSelect}
                    className="cursor-pointer hover:bg-accent"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue === pair.symbol ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{pair.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {pair.baseAsset}/{pair.quoteAsset}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Informações do Par Selecionado */}
      {selectedValue && (
        <div className="mt-4 p-4 border rounded-lg">
          <h3 className="font-medium mb-2">{t.trading.pairInfo}</h3>
          {pairs.filter(p => p.symbol === selectedValue).map(pair => (
            <div key={pair.symbol} className="space-y-2 text-sm">
              <p>{t.trading.pair}: {pair.symbol}</p>
              <p>{t.trading.base}: {pair.baseAsset}</p>
              <p>{t.trading.quote}: {pair.quoteAsset}</p>
              <p>{t.trading.basePrecision}: {pair.baseAssetPrecision}</p>
              <p>{t.trading.quotePrecision}: {pair.quoteAssetPrecision}</p>
              {pair.filters.map((filter, index) => (
                <div key={index} className="text-xs text-gray-600">
                  {filter.filterType}: {
                    filter.minQty ? `${t.trading.min}: ${filter.minQty}` : ''
                  } {
                    filter.maxQty ? `${t.trading.max}: ${filter.maxQty}` : ''
                  } {
                    filter.stepSize ? `${t.trading.step}: ${filter.stepSize}` : ''
                  }
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
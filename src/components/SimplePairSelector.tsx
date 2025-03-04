import React, { useState, useMemo, useEffect } from 'react';
import { MexcSymbol } from '../lib/types';
import { useLanguage } from '../lib/i18n/LanguageContext';

export interface SimplePairSelectorProps {
  onSelect: (pair: MexcSymbol) => void;
  quoteAsset: string;
  pairs: MexcSymbol[];
  initialValue?: string;
}

export function SimplePairSelector({ onSelect, quoteAsset, pairs, initialValue }: SimplePairSelectorProps) {
  const { t } = useLanguage();
  const [selectedPair, setSelectedPair] = useState<string>(initialValue || '');

  // Filtrar pares pelo Quote Asset
  const filteredPairs = useMemo(() => {
    // Primeiro, garantir que o par inicial seja incluído se existir
    const initialPair = initialValue ? pairs.find(p => p.symbol === initialValue) : null;
    
    // Filtrar os pares pelo Quote Asset
    const filteredByQuote = pairs.filter(pair => {
      // Se for o par inicial, incluir
      if (initialValue && pair.symbol === initialValue) {
        return true;
      }
      
      // Verificar se o Quote Asset corresponde exatamente
      return pair.quoteAsset.toUpperCase() === quoteAsset.toUpperCase();
    });

    // Ordenar os pares: par inicial primeiro (se existir), depois por ordem alfabética
    return filteredByQuote.sort((a, b) => {
      if (a.symbol === initialValue) return -1;
      if (b.symbol === initialValue) return 1;
      return a.baseAsset.localeCompare(b.baseAsset);
    });
  }, [pairs, quoteAsset, initialValue]);

  const handlePairChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const symbol = event.target.value;
    if (symbol === selectedPair) return; // Evita atualizações desnecessárias
    
    setSelectedPair(symbol);
    
    // Encontrar o par selecionado
    const pair = pairs.find(p => p.symbol === symbol);
    if (pair) {
      console.log('Par selecionado:', {
        symbol: pair.symbol,
        baseAsset: pair.baseAsset,
        quoteAsset: pair.quoteAsset
      });
      onSelect(pair);
    }
  };

  // Selecionar o par inicial quando disponível
  useEffect(() => {
    if (initialValue && initialValue !== selectedPair) {
      const initialPair = pairs.find(p => p.symbol === initialValue);
      if (initialPair) {
        console.log('Selecionando par inicial:', {
          symbol: initialPair.symbol,
          baseAsset: initialPair.baseAsset,
          quoteAsset: initialPair.quoteAsset
        });
        setSelectedPair(initialValue);
        onSelect(initialPair);
      }
    }
  }, [initialValue, pairs]); // Removido selectedPair e onSelect das dependências

  // Atualizar selectedPair quando o quoteAsset mudar
  useEffect(() => {
    if (quoteAsset && selectedPair) {
      const currentPair = pairs.find(p => p.symbol === selectedPair);
      if (currentPair && currentPair.quoteAsset !== quoteAsset) {
        setSelectedPair('');
      }
    }
  }, [quoteAsset, pairs]);

  return (
    <select
      value={selectedPair}
      onChange={handlePairChange}
      className="w-full p-2 border rounded-md bg-background text-foreground dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
    >
      <option value="">{t.trading.selectPair}</option>
      {filteredPairs.map((pair) => (
        <option key={pair.symbol} value={pair.symbol}>
          {pair.baseAsset}/{pair.quoteAsset}
        </option>
      ))}
    </select>
  );
} 
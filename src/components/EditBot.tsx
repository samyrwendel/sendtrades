import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WebhookExamples } from './WebhookExamples';
import { getAvailablePairs } from '../lib/mexcService';
import { MexcSymbol } from '../lib/types';

const API_URL = import.meta.env.VITE_API_URL;

// Lista de Quote Assets conhecidos em ordem de prioridade
const KNOWN_QUOTE_ASSETS = [
  'USDT',
  'USDC',
  'USDE',
  'TUSD',
  'BUSD',
  'EUR',
  'BTC',
  'ETH'
];

export function EditBot() {
  const { id } = useParams();
  const location = useLocation();
  const [pairs, setPairs] = useState<MexcSymbol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    tradingPair: '',
    selectedPair: '',
    exchange: null,
    baseAsset: '',
    quoteAsset: '',
    public_id: ''
  });

  // Função para extrair Base e Quote Assets do par de trading
  const extractAssetsFromPair = (pair: string) => {
    if (!pair) return { baseAsset: '', quoteAsset: '' };
    
    const upperPair = pair.toUpperCase();
    
    // Tentar encontrar o Quote Asset no final do par
    for (const quote of KNOWN_QUOTE_ASSETS) {
      if (upperPair.endsWith(quote)) {
        const base = upperPair.slice(0, -quote.length);
        if (base) {
          return { baseAsset: base, quoteAsset: quote };
        }
      }
    }
    
    return { baseAsset: '', quoteAsset: '' };
  };

  const loadTradingPairs = async (exchangeName: string) => {
    try {
      console.log('🔄 Carregando pares de trading...');
      const result = await getAvailablePairs();
      if (result.success && result.pairs) {
        console.log('✅ Pares carregados:', result.pairs.length);
        setPairs(result.pairs);
        return result.pairs;
      } else {
        console.error('❌ Erro ao carregar pares:', result.error);
        toast.error('Erro ao carregar pares de trading');
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao carregar pares:', error);
      toast.error('Erro ao carregar pares de trading');
      return [];
    }
  };

  // Carregar dados do bot
  useEffect(() => {
    const loadBot = async () => {
      try {
        if (id) {
          const token = localStorage.getItem('session');
          const response = await fetch(`${API_URL}/api/bots/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Falha ao carregar dados do bot');
          }

          const data = await response.json();
          console.log('📥 Dados do bot carregados:', data);
          
          // Extrair Base e Quote Assets do par de trading
          const { baseAsset, quoteAsset } = data.exchange?.config?.tradingInfo?.baseAsset 
            ? { 
                baseAsset: data.exchange.config.tradingInfo.baseAsset,
                quoteAsset: data.exchange.config.tradingInfo.quoteAsset
              }
            : extractAssetsFromPair(data.tradingPair);
          
          console.log('📊 Assets extraídos:', { baseAsset, quoteAsset });
          
          // Atualizar o formData imediatamente com os dados do bot
          setFormData({
            name: data.name || '',
            tradingPair: data.tradingPair || '',
            selectedPair: data.tradingPair || '',
            exchange: data.exchange || null,
            baseAsset,
            quoteAsset,
            public_id: data.public_id || ''
          });
          
          // Carregar pares disponíveis em segundo plano
          if (data.exchange?.name) {
            const availablePairs = await loadTradingPairs(data.exchange.name);
            
            // Procurar o par nos pares disponíveis
            const selectedPair = availablePairs.find(p => p.symbol === data.tradingPair);
            console.log('🔍 Procurando par:', data.tradingPair, 'Encontrado:', selectedPair);
            
            // Atualizar apenas se encontrou informações adicionais
            if (selectedPair) {
              setFormData(prev => ({
                ...prev,
                baseAsset: selectedPair.baseAsset || baseAsset,
                quoteAsset: selectedPair.quoteAsset || quoteAsset
              }));
            }
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar bot:', error);
        toast.error('Erro ao carregar dados do bot');
      } finally {
        setIsLoading(false);
      }
    };

    loadBot();
  }, [id]);

  const handlePairSelect = (value: string) => {
    console.log('📊 Selecionando par:', value);
    const selectedPair = pairs.find(p => p.symbol === value);
    if (selectedPair) {
      console.log('✅ Par encontrado:', selectedPair);
      setFormData(prev => ({
        ...prev,
        selectedPair: value,
        tradingPair: value,
        baseAsset: selectedPair.baseAsset,
        quoteAsset: selectedPair.quoteAsset
      }));
    } else {
      // Se não encontrar o par nos pares disponíveis, tentar extrair do valor
      const { baseAsset, quoteAsset } = extractAssetsFromPair(value);
      if (baseAsset && quoteAsset) {
        setFormData(prev => ({
          ...prev,
          selectedPair: value,
          tradingPair: value,
          baseAsset,
          quoteAsset
        }));
      }
    }
  };

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-2xl font-bold">Editar Bot</h1>
      
      {/* ... outros campos ... */}

      {/* Seleção do Par de Trading */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Par de Trading</label>
        <Select
          value={formData.selectedPair}
          onValueChange={handlePairSelect}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um par...">
              {formData.tradingPair ? `${formData.baseAsset}/${formData.quoteAsset}` : "Selecione um par..."}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {pairs.map((pair) => (
              <SelectItem key={pair.symbol} value={pair.symbol}>
                {pair.baseAsset}/{pair.quoteAsset}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formData.selectedPair && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>Base Asset: {formData.baseAsset}</p>
            <p>Quote Asset: {formData.quoteAsset}</p>
          </div>
        )}
      </div>

      {/* Exemplos de Webhook */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Exemplos de Webhook</h2>
        <WebhookExamples 
          publicId={formData.public_id || ''} 
          tradingPair={formData.tradingPair || ''} 
        />
      </div>
    </div>
  );
} 
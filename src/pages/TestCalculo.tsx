/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import { validateMexcApiKeys } from '../lib/mexcService';
import { Balance } from '../lib/exchanges/types';
import { Bot } from '../lib/types';
import { calculateOrderQuantity } from '../lib/orderCalculator';
import axios from 'axios';
import { Button } from '../components/ui/button';

const API_URL = import.meta.env.VITE_API_URL;

interface OrderCalc {
  percentage: string;
  quantity: string;
  baseAmount: string;
  quoteAmount: string;
  error?: string;
}

export default function TestCalculo() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [bot, setBot] = useState<Bot | null>(null);
  const [calculations, setCalculations] = useState<OrderCalc[]>([]);
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState<string>('0');

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
      } else {
        setError('Nenhum bot encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar bot:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar bot');
    }
  }

  async function loadBalances(currentBot: Bot) {
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
        } else {
          try {
            const { data } = await axios.get(`/api/v3/ticker/price?symbol=${balance.asset}USDT`);
            if (data.price) {
              const value = (parseFloat(balance.free) + parseFloat(balance.locked)) * parseFloat(data.price);
              total += value;
            }
          } catch (e) {
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
      } catch (e) {
        console.error(`Erro ao obter preço de ${selectedPair}:`, e);
      }

      setLoading(false);
    } catch (error) {
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
      const results: OrderCalc[] = [];

      for (const percentage of percentages) {
        try {
          const calc = await calculateOrderQuantity(
            balances,
            percentage,
            selectedPair,
            priceData.price || currentPrice
          );

          results.push({
            percentage,
            quantity: calc.quantity,
            baseAmount: calc.baseAmount,
            quoteAmount: calc.quoteAmount,
            error: calc.error
          });
        } catch (error) {
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
    } catch (error) {
      console.error('Erro ao calcular ordens:', error);
      setError(error instanceof Error ? error.message : 'Erro ao calcular ordens');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h2 className="text-lg font-bold mb-2">Erro</h2>
        <p>{error}</p>
        <button 
          onClick={() => bot ? loadBalances(bot) : loadBot()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Cabeçalho com Total */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Overview da Conta</h1>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          ${totalBalance.toFixed(2)} USDT
        </div>
        <div className="flex space-x-4 mt-4">
          <Button 
            onClick={() => bot ? loadBalances(bot) : loadBot()}
            variant="default"
          >
            Atualizar Saldos
          </Button>
          <Button 
            onClick={calculateOrders}
            variant="success"
          >
            Calcular Ordens
          </Button>
        </div>
      </div>

      {/* Preço Atual */}
      {currentPrice !== '0' && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-2">Preço Atual</h2>
          <div className="text-2xl text-green-500">
            {selectedPair}: ${parseFloat(currentPrice).toFixed(2)} USDT
          </div>
        </div>
      )}

      {/* Resultados dos Cálculos */}
      {calculations.length > 0 && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {calculations.map((calc, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">{calc.percentage} do Saldo</h3>
              {calc.error ? (
                <div className="text-red-500">{calc.error}</div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Quantidade</span>
                    <span>{parseFloat(calc.quantity).toFixed(8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Valor Base</span>
                    <span>{parseFloat(calc.baseAmount).toFixed(8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Valor USDT</span>
                    <span>{parseFloat(calc.quoteAmount).toFixed(2)} USDT</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lista de Saldos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {balances
          .sort((a, b) => {
            const aTotal = parseFloat(a.free) + parseFloat(a.locked);
            const bTotal = parseFloat(b.free) + parseFloat(b.locked);
            return bTotal - aTotal;
          })
          .map((balance, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{balance.asset}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {(parseFloat(balance.free) + parseFloat(balance.locked)).toFixed(8)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Disponível</span>
                  <span>{parseFloat(balance.free).toFixed(8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Em Ordem</span>
                  <span>{parseFloat(balance.locked).toFixed(8)}</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
} 
import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { getExchange, Balance, ExchangeCredentials } from '../lib/exchanges';
import { TradeModal } from './TradeModal';
import { Button } from './ui/button';

interface SpotTradingProps {
  credentials: ExchangeCredentials;
  exchangeName: string;
}

export function SpotTrading({ credentials, exchangeName }: SpotTradingProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean;
    type: 'buy' | 'sell';
    balance: string;
    symbol: string;
    quoteBalance?: string;
    quoteCurrency?: string;
  }>({
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
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrade = (type: 'buy' | 'sell', balance: string, symbol: string) => {
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

  const handleTradeSubmit = async (amount: string) => {
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
    } catch (error) {
      console.error('Trade execution failed:', error);
    }
  };

  const formatBalance = (value: string) => {
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

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <Wallet className="w-5 h-5 mr-2" />
        Spot Trading
      </button>

      {/* Spot Trading Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Spot Trading
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {displayBalances.map((balance) => (
                  <div
                    key={balance.asset}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {balance.asset}
                      </span>
                      <div className="text-sm">
                        <span className="text-gray-900 dark:text-white">
                          {formatBalance(balance.free)}
                        </span>
                        {parseFloat(balance.locked) > 0 && (
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            ({formatBalance(balance.locked)} locked)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleTrade('buy', balance.free, balance.asset)}
                        variant="success"
                        size="sm"
                      >
                        Buy
                      </Button>
                      <Button
                        onClick={() => handleTrade('sell', balance.free, balance.asset)}
                        variant="destructive"
                        size="sm"
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trade Modal */}
      <TradeModal
        isOpen={tradeModal.isOpen}
        onClose={() => setTradeModal(prev => ({ ...prev, isOpen: false }))}
        type={tradeModal.type}
        balance={tradeModal.balance}
        symbol={tradeModal.symbol}
        quoteBalance={tradeModal.quoteBalance}
        quoteCurrency={tradeModal.quoteCurrency}
        onSubmit={handleTradeSubmit}
      />
    </>
  );
}
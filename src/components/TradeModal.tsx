import React, { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'buy' | 'sell';
  balance: string;
  symbol: string;
  quoteBalance?: string;
  quoteCurrency?: string;
  onSubmit: (amount: string) => void;
}

export function TradeModal({ 
  isOpen, 
  onClose, 
  type, 
  balance, 
  symbol, 
  quoteBalance,
  quoteCurrency,
  onSubmit 
}: TradeModalProps) {
  const [amount, setAmount] = useState('');
  const maxAmount = type === 'buy' ? parseFloat(quoteBalance || '0') : parseFloat(balance);

  const handlePercentageClick = (percentage: number) => {
    const calculatedAmount = (maxAmount * percentage).toFixed(8);
    setAmount(calculatedAmount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(amount);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          {type === 'buy' ? (
            <ArrowUp className="w-6 h-6 text-green-500 mr-2" />
          ) : (
            <ArrowDown className="w-6 h-6 text-red-500 mr-2" />
          )}
          {type === 'buy' ? 'Buy' : 'Sell'} {symbol}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Show both balances */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {symbol} Balance:
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {parseFloat(balance).toFixed(8)} {symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {quoteCurrency} Balance:
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {parseFloat(quoteBalance || '0').toFixed(2)} {quoteCurrency}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {type === 'buy' ? `Amount (${quoteCurrency})` : `Amount (${symbol})`}
              </label>
              <div className="flex space-x-2 mb-2">
                <button
                  type="button"
                  onClick={() => handlePercentageClick(0.25)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentageClick(0.5)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentageClick(1)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  100%
                </button>
              </div>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter amount in ${type === 'buy' ? quoteCurrency : symbol}`}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                type === 'buy'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {type === 'buy' ? 'Buy' : 'Sell'} {symbol}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
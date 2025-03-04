import React from 'react';
import { CopyButton } from './CopyButton';
import { toast } from 'sonner';

interface WebhookExampleProps {
  publicId: string;
  tradingPair: string;
}

export function WebhookExamples({ publicId, tradingPair }: WebhookExampleProps) {
  const currentTimestamp = Math.floor(Date.now() / 1000);

  const buyExample = `{
  "action": "buy",
  "ticker": "${tradingPair}",
  "order_size": "100%",
  "position_size": 1,
  "schema": "2",
  "timestamp": "{{time}}",
  "public_id": "${publicId}"
}`;

  const sellExample = `{
  "action": "sell",
  "ticker": "${tradingPair}",
  "order_size": "100%",
  "position_size": 0,
  "schema": "2",
  "timestamp": "{{time}}",
  "public_id": "${publicId}"
}`;

  const handleCopy = (text: string, type: 'compra' | 'venda') => {
    toast.success(`Exemplo de ${type} copiado!`, {
      duration: 1500,
      position: 'top-right'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Exemplo de Compra</h3>
        <div className="relative">
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm">{buyExample}</code>
          </pre>
          <CopyButton text={buyExample} className="absolute top-2 right-2" onCopy={() => handleCopy(buyExample, 'compra')} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Exemplo de Venda</h3>
        <div className="relative">
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm">{sellExample}</code>
          </pre>
          <CopyButton text={sellExample} className="absolute top-2 right-2" onCopy={() => handleCopy(sellExample, 'venda')} />
        </div>
      </div>
    </div>
  );
} 
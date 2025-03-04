import React from 'react';
import { CopyButton } from './CopyButton';

interface NewBotWebhookExampleProps {
  publicId: string;
  tradingPair: string;
}

export function NewBotWebhookExamples({ publicId, tradingPair }: NewBotWebhookExampleProps) {
  const buyExample = {
    action: "buy",
    ticker: tradingPair,
    order_size: "100%",
    position_size: 1,
    schema: "2",
    timestamp: "{{time}}",
    public_id: publicId
  };

  const sellExample = {
    action: "sell",
    ticker: tradingPair,
    order_size: "100%",
    position_size: 0,
    schema: "2",
    timestamp: "{{time}}",
    public_id: publicId
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Exemplo de Compra</h3>
        <div className="relative">
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm">
              {JSON.stringify(buyExample, null, 2)
                .replace('"{{time}}"', "{{time}}")
              }
            </code>
          </pre>
          <CopyButton 
            text={JSON.stringify(buyExample, null, 2)
              .replace('"{{time}}"', "{{time}}")
            } 
            className="absolute top-2 right-2" 
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Exemplo de Venda</h3>
        <div className="relative">
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm">
              {JSON.stringify(sellExample, null, 2)
                .replace('"{{time}}"', "{{time}}")
              }
            </code>
          </pre>
          <CopyButton 
            text={JSON.stringify(sellExample, null, 2)
              .replace('"{{time}}"', "{{time}}")
            } 
            className="absolute top-2 right-2" 
          />
        </div>
      </div>
    </div>
  );
} 
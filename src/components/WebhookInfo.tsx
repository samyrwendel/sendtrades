import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Bot } from '../lib/types';

interface WebhookInfoProps {
  bot: Bot;
}

export function WebhookInfo({ bot }: WebhookInfoProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!bot.webhook?.enabled) return null;

  // URL do endpoint de trading
  const webhookUrl = `${window.location.protocol}//${window.location.hostname}:5173/trading`;

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Exemplos de payload baseados nas imagens fornecidas
  const examplePayloads = [
    {
      action: "buy",
      ticker: "BTCUSD",
      order_size: "100%",
      position_size: "1",
      schema: "2",
      timestamp: "2025-02-08T02:12:18.313Z",
      public_id: bot.public_id
    },
    {
      action: "buy",
      ticker: "BTCUSD",
      order_size: "25%",
      position_size: "1",
      schema: "2",
      timestamp: "2025-02-08T02:12:51.028Z",
      public_id: bot.public_id
    },
    {
      action: "buy",
      ticker: "BTCUSD",
      order_size: "0.5",
      position_size: "0.5",
      schema: "2",
      timestamp: "2025-02-08T02:13:02.336Z",
      public_id: bot.public_id
    }
  ];

  // Documentação detalhada dos campos
  const fieldDocs = [
    {
      field: "public_id",
      description: "Identificador único do seu bot. Mantenha em segredo para proteger seus bots.",
      example: bot.public_id,
      required: true
    },
    {
      field: "ticker",
      description: "Usado para proteger contra sinais enviados ao bot errado. Aceita variações como BTC/USD, BTCUSD, BTC/USDC, etc. O sinal será rejeitado se o ticker for muito diferente do par configurado no bot.",
      example: "BTCUSD",
      required: true
    },
    {
      field: "order_size",
      description: `Especifica quanto comprar/vender em termos do ativo base. 
      Pode ser porcentagem (ex: "69%") ou valor absoluto (ex: "0.042").
      Com porcentagem, o sistema calcula baseado no seu saldo.
      Com valor absoluto, especifica exatamente quanto negociar.`,
      example: ["100%", "0.5"],
      required: true
    },
    {
      field: "position_size",
      description: `Especifica o tamanho da posição APÓS a execução da ordem.
      Com order_size em %:
      "1" = posição long
      "0" = posição zerada
      "-1" = posição short (será zerada até suporte a short)
      
      Com order_size em valor absoluto:
      Especifica exatamente quanto você quer manter após a ordem.
      Ex: "0.12" = manter 0.12 do ativo
      "0" = zerar posição
      "-0.42" = short (será zerado até suporte a short)`,
      example: ["1", "0", "0.5"],
      required: true
    },
    {
      field: "action",
      description: 'Ação a ser executada: "buy" ou "sell"',
      example: ["buy", "sell"],
      required: true
    },
    {
      field: "timestamp",
      description: "Timestamp ISO para evitar duplicação de sinais. Formato: YYYY-MM-DDTHH:mm:ssZ",
      example: "2024-09-16T10:15:00Z",
      required: true
    }
  ];

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {t.bots.webhookEndpoint}
      </h4>

      <div className="space-y-6">
        {/* URL do Webhook */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Endpoint URL
          </label>
          <div className="flex items-center">
            <code className="flex-1 block p-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-l">
              {webhookUrl}
            </code>
            <button
              onClick={handleCopy}
              className="p-2 bg-gray-200 dark:bg-gray-600 rounded-r hover:bg-gray-300 dark:hover:bg-gray-500"
              title="Copiar URL"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Documentação dos Campos */}
        <div>
          <h5 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Documentação dos Campos
          </h5>
          <div className="space-y-6">
            {fieldDocs.map((doc) => (
              <div key={doc.field} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <code className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {doc.field}
                    {doc.required && <span className="text-red-500">*</span>}
                  </code>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {doc.description}
                </p>
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Exemplo{Array.isArray(doc.example) ? 's' : ''}:
                  </span>
                  <div className="mt-1 space-y-1">
                    {Array.isArray(doc.example) ? (
                      doc.example.map((ex, i) => (
                        <code key={i} className="block text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                          {doc.field}: "{ex}"
                        </code>
                      ))
                    ) : (
                      <code className="block text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                        {doc.field}: "{doc.example}"
                      </code>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exemplos de Payload */}
        <div>
          <h5 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Exemplos de Payload
          </h5>
          <div className="space-y-4">
            {/* Exemplo 1: 100% */}
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Compra/Venda 100%:
              </p>
              <pre className="p-4 bg-gray-100 dark:bg-gray-700 rounded overflow-x-auto">
                <code className="text-sm">
                  {JSON.stringify(examplePayloads[0], null, 2)}
                </code>
              </pre>
            </div>

            {/* Exemplo 2: 25% */}
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Compra 25% / Venda 80%:
              </p>
              <pre className="p-4 bg-gray-100 dark:bg-gray-700 rounded overflow-x-auto">
                <code className="text-sm">
                  {JSON.stringify(examplePayloads[1], null, 2)}
                </code>
              </pre>
            </div>

            {/* Exemplo 3: Valor absoluto */}
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Valores absolutos:
              </p>
              <pre className="p-4 bg-gray-100 dark:bg-gray-700 rounded overflow-x-auto">
                <code className="text-sm">
                  {JSON.stringify(examplePayloads[2], null, 2)}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Informações de Segurança */}
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>
            <strong>Chave Secreta:</strong> {bot.webhook.secretKey}
          </p>
          {bot.webhook.allowedIPs && bot.webhook.allowedIPs.length > 0 && (
            <p>
              <strong>IPs Permitidos:</strong> {bot.webhook.allowedIPs.join(', ')}
            </p>
          )}
          <p>
            <strong>Limite de Ordens:</strong> {bot.webhook.maxOrdersPerMinute} por minuto
          </p>
        </div>

        {/* Instruções */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium mb-2">Instruções:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Use o endpoint acima para enviar ordens para o bot</li>
            <li>Envie uma requisição POST com Content-Type: application/json</li>
            <li>Adicione o IP do servidor na lista de IPs permitidos</li>
            <li>Siga o formato dos exemplos acima para o payload</li>
            <li>O campo timestamp deve estar no formato ISO 8601</li>
            <li>O campo order_size pode ser porcentagem (ex: "100%") ou valor absoluto (ex: "0.5")</li>
            <li>Certifique-se que o ticker corresponde ao par de trading configurado no bot</li>
            <li>Mantenha o public_id em segredo para proteger suas operações</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 
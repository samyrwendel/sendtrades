import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { Button } from './ui/button';

const BotForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    tradingPair: initialData?.tradingPair || '',
    public_id: initialData?.public_id || '',
    exchange: {
      name: 'MEXC',
      credentials: {
        apiKey: '',
        secretKey: ''
      }
    }
  });

  const [webhookExample, setWebhookExample] = useState({
    action: "{{strategy.order.action}}",
    ticker: "{{ticker}}",
    order_size: "100%",
    position_size: "{{strategy.position_size}}",
    schema: "2",
    timestamp: "{{time}}",
    public_id: "Aguardando validação..."
  });

  const handleValidateCredentials = async () => {
    try {
      const response = await api.post('/bots/validate-credentials', {
        exchange: formData.exchange.name,
        credentials: formData.exchange.credentials
      });

      if (response.data.success) {
        // Atualiza o formData com o public_id gerado
        setFormData(prev => ({
          ...prev,
          public_id: response.data.public_id
        }));

        // Atualiza o exemplo do webhook com o public_id
        setWebhookExample(prev => ({
          ...prev,
          public_id: response.data.public_id
        }));

        toast.success('Credenciais validadas com sucesso!');
      }
    } catch (error) {
      console.error('❌ Erro ao validar credenciais:', error);
      toast.error('Erro ao validar credenciais');
    }
  };

  // Adiciona a seção de exemplo do webhook
  const WebhookExample = () => (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Exemplo para TradingView:</h3>
      <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
        {JSON.stringify(webhookExample, null, 2)}
      </pre>
      <Button
        onClick={() => navigator.clipboard.writeText(JSON.stringify(webhookExample, null, 2))}
        variant="default"
        className="mt-2"
      >
        Copiar
      </Button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      {/* ... outros campos ... */}
      
      {/* Seção de credenciais */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">API Key</label>
        <input
          type="text"
          value={formData.exchange.credentials.apiKey}
          onChange={(e) => handleCredentialsChange('apiKey', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Secret Key</label>
        <input
          type="password"
          value={formData.exchange.credentials.secretKey}
          onChange={(e) => handleCredentialsChange('secretKey', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <Button
        type="button"
        onClick={handleValidateCredentials}
        variant="success"
      >
        Validar Credenciais
      </Button>

      {/* Exemplo do Webhook */}
      {formData.public_id && <WebhookExample />}

      {/* ... outros campos ... */}
    </form>
  );
};

export default BotForm; 
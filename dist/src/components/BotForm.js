import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
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
        }
        catch (error) {
            console.error('❌ Erro ao validar credenciais:', error);
            toast.error('Erro ao validar credenciais');
        }
    };
    // Adiciona a seção de exemplo do webhook
    const WebhookExample = () => (_jsxs("div", { className: "mt-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Exemplo para TradingView:" }), _jsx("pre", { className: "bg-gray-800 p-4 rounded-lg overflow-x-auto", children: JSON.stringify(webhookExample, null, 2) }), _jsx("button", { onClick: () => navigator.clipboard.writeText(JSON.stringify(webhookExample, null, 2)), className: "mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", children: "Copiar" })] }));
    return (_jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "API Key" }), _jsx("input", { type: "text", value: formData.exchange.credentials.apiKey, onChange: (e) => handleCredentialsChange('apiKey', e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Secret Key" }), _jsx("input", { type: "password", value: formData.exchange.credentials.secretKey, onChange: (e) => handleCredentialsChange('secretKey', e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm" })] }), _jsx("button", { type: "button", onClick: handleValidateCredentials, className: "mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700", children: "Validar Credenciais" }), formData.public_id && _jsx(WebhookExample, {})] }));
};
export default BotForm;

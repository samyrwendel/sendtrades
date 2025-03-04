import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
export function WebhookInfo({ bot }) {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);
    if (!bot.webhook?.enabled)
        return null;
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
    return (_jsxs("div", { className: "mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 dark:text-white mb-4", children: t.bots.webhookEndpoint }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Endpoint URL" }), _jsxs("div", { className: "flex items-center", children: [_jsx("code", { className: "flex-1 block p-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-l", children: webhookUrl }), _jsx("button", { onClick: handleCopy, className: "p-2 bg-gray-200 dark:bg-gray-600 rounded-r hover:bg-gray-300 dark:hover:bg-gray-500", title: "Copiar URL", children: copied ? (_jsx(Check, { className: "w-5 h-5 text-green-500" })) : (_jsx(Copy, { className: "w-5 h-5 text-gray-500 dark:text-gray-400" })) })] })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-md font-medium text-gray-900 dark:text-white mb-4", children: "Documenta\u00E7\u00E3o dos Campos" }), _jsx("div", { className: "space-y-6", children: fieldDocs.map((doc) => (_jsxs("div", { className: "bg-gray-100 dark:bg-gray-700 rounded-lg p-4", children: [_jsx("div", { className: "flex items-start justify-between", children: _jsxs("code", { className: "text-sm font-bold text-indigo-600 dark:text-indigo-400", children: [doc.field, doc.required && _jsx("span", { className: "text-red-500", children: "*" })] }) }), _jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line", children: doc.description }), _jsxs("div", { className: "mt-2", children: [_jsxs("span", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: ["Exemplo", Array.isArray(doc.example) ? 's' : '', ":"] }), _jsx("div", { className: "mt-1 space-y-1", children: Array.isArray(doc.example) ? (doc.example.map((ex, i) => (_jsxs("code", { className: "block text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded", children: [doc.field, ": \"", ex, "\""] }, i)))) : (_jsxs("code", { className: "block text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded", children: [doc.field, ": \"", doc.example, "\""] })) })] })] }, doc.field))) })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-md font-medium text-gray-900 dark:text-white mb-4", children: "Exemplos de Payload" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-2", children: "Compra/Venda 100%:" }), _jsx("pre", { className: "p-4 bg-gray-100 dark:bg-gray-700 rounded overflow-x-auto", children: _jsx("code", { className: "text-sm", children: JSON.stringify(examplePayloads[0], null, 2) }) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-2", children: "Compra 25% / Venda 80%:" }), _jsx("pre", { className: "p-4 bg-gray-100 dark:bg-gray-700 rounded overflow-x-auto", children: _jsx("code", { className: "text-sm", children: JSON.stringify(examplePayloads[1], null, 2) }) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-2", children: "Valores absolutos:" }), _jsx("pre", { className: "p-4 bg-gray-100 dark:bg-gray-700 rounded overflow-x-auto", children: _jsx("code", { className: "text-sm", children: JSON.stringify(examplePayloads[2], null, 2) }) })] })] })] }), _jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-400 space-y-2", children: [_jsxs("p", { children: [_jsx("strong", { children: "Chave Secreta:" }), " ", bot.webhook.secretKey] }), bot.webhook.allowedIPs && bot.webhook.allowedIPs.length > 0 && (_jsxs("p", { children: [_jsx("strong", { children: "IPs Permitidos:" }), " ", bot.webhook.allowedIPs.join(', ')] })), _jsxs("p", { children: [_jsx("strong", { children: "Limite de Ordens:" }), " ", bot.webhook.maxOrdersPerMinute, " por minuto"] })] }), _jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: [_jsx("p", { className: "font-medium mb-2", children: "Instru\u00E7\u00F5es:" }), _jsxs("ol", { className: "list-decimal list-inside space-y-1", children: [_jsx("li", { children: "Use o endpoint acima para enviar ordens para o bot" }), _jsx("li", { children: "Envie uma requisi\u00E7\u00E3o POST com Content-Type: application/json" }), _jsx("li", { children: "Adicione o IP do servidor na lista de IPs permitidos" }), _jsx("li", { children: "Siga o formato dos exemplos acima para o payload" }), _jsx("li", { children: "O campo timestamp deve estar no formato ISO 8601" }), _jsx("li", { children: "O campo order_size pode ser porcentagem (ex: \"100%\") ou valor absoluto (ex: \"0.5\")" }), _jsx("li", { children: "Certifique-se que o ticker corresponde ao par de trading configurado no bot" }), _jsx("li", { children: "Mantenha o public_id em segredo para proteger suas opera\u00E7\u00F5es" })] })] })] })] }));
}

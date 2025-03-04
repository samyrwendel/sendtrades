import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CopyButton } from './CopyButton';
export function NewBotWebhookExamples({ publicId, tradingPair }) {
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2 dark:text-white", children: "Exemplo de Compra" }), _jsxs("div", { className: "relative", children: [_jsx("pre", { className: "bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto", children: _jsx("code", { className: "text-sm", children: JSON.stringify(buyExample, null, 2)
                                        .replace('"{{time}}"', "{{time}}") }) }), _jsx(CopyButton, { text: JSON.stringify(buyExample, null, 2)
                                    .replace('"{{time}}"', "{{time}}"), className: "absolute top-2 right-2" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2 dark:text-white", children: "Exemplo de Venda" }), _jsxs("div", { className: "relative", children: [_jsx("pre", { className: "bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto", children: _jsx("code", { className: "text-sm", children: JSON.stringify(sellExample, null, 2)
                                        .replace('"{{time}}"', "{{time}}") }) }), _jsx(CopyButton, { text: JSON.stringify(sellExample, null, 2)
                                    .replace('"{{time}}"', "{{time}}"), className: "absolute top-2 right-2" })] })] })] }));
}

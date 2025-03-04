import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpCircle, ArrowDownCircle, AlertTriangle, Info, CheckCircle2, Clock, Calculator } from 'lucide-react';
export function LogItem({ log }) {
    // Função para determinar a cor do card baseado no tipo e status do log
    const getCardStyle = () => {
        if (log.type === 'webhook_error') {
            return 'bg-yellow-100/80 dark:bg-yellow-500/20 border-yellow-400 dark:border-yellow-500';
        }
        switch (log.action) {
            case 'buy':
                return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
            case 'sell':
                return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
            default:
                return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
        }
    };
    // Função para obter o ícone baseado no tipo de log
    const getIcon = () => {
        if (log.type === 'webhook_error') {
            return _jsx(AlertTriangle, { className: "w-6 h-6 text-yellow-500" });
        }
        switch (log.action) {
            case 'buy':
                return _jsx(ArrowUpCircle, { className: "w-6 h-6 text-green-500" });
            case 'sell':
                return _jsx(ArrowDownCircle, { className: "w-6 h-6 text-red-500" });
            case 'validate':
                return _jsx(Info, { className: "w-6 h-6 text-blue-500" });
            case 'process':
                return _jsx(Clock, { className: "w-6 h-6 text-blue-500" });
            default:
                return _jsx(Info, { className: "w-6 h-6 text-blue-500" });
        }
    };
    // Função para obter o estilo do badge de status
    const getStatusBadgeStyle = () => {
        switch (log.status) {
            case 'success':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'error':
                return 'bg-yellow-300 text-yellow-900 dark:bg-yellow-400 dark:text-yellow-900';
            case 'processing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };
    const getStatusClass = () => {
        if (log.status === 'error') {
            return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
        }
        switch (log.action) {
            case 'buy':
                return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
            case 'sell':
                return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
            default:
                return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
        }
    };
    // Função para formatar o status
    const formatStatus = (status) => {
        switch (status) {
            case 'success':
                return 'Sucesso';
            case 'error':
                return 'Erro';
            case 'processing':
                return 'Processando';
            case 'received':
                return 'Recebido';
            case 'calculated':
                return 'Calculado';
            case 'executed':
                return 'Executado';
            default:
                return status;
        }
    };
    // Função para formatar o timestamp
    const formatTimestamp = (timestamp) => {
        return format(new Date(timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
    };
    // Função para obter o ícone do status
    const getStatusIcon = () => {
        switch (log.status) {
            case 'success':
                return _jsx(CheckCircle2, { className: "w-4 h-4" });
            case 'processing':
                return _jsx(Clock, { className: "w-4 h-4" });
            case 'calculated':
                return _jsx(Calculator, { className: "w-4 h-4" });
            case 'error':
                return _jsx(AlertTriangle, { className: "w-4 h-4" });
            default:
                return _jsx(Info, { className: "w-4 h-4" });
        }
    };
    // Verificar se há avisos no metadata
    const hasWarnings = log.metadata?.warnings && log.metadata.warnings.length > 0;
    return (_jsxs("div", { className: `border rounded-lg p-4 shadow-sm ${getCardStyle()}`, children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [getIcon(), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: log.message }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: formatTimestamp(log.timestamp) })] })] }), _jsxs("span", { className: `px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusBadgeStyle()}`, children: [getStatusIcon(), formatStatus(log.status)] })] }), hasWarnings && (_jsx("div", { className: "mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md", children: log.metadata.warnings.map((warning, index) => (_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4 text-yellow-500 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-yellow-700 dark:text-yellow-300", children: warning.message }), warning.details && (_jsxs("p", { className: "text-xs text-yellow-600 dark:text-yellow-400 mt-1", children: ["Valor calculado: ", warning.details.calculatedAmount.toFixed(2), " ", warning.details.unit] }))] })] }, index))) })), log.details && (_jsx("div", { className: "mt-3 text-sm text-gray-600 dark:text-gray-400", children: log.details.split('\n').map((line, index) => (_jsx("p", { className: "whitespace-pre-wrap", children: line.trim() }, index))) })), log.payload && (_jsx("div", { className: "mt-3", children: _jsxs("details", { className: "text-sm", children: [_jsx("summary", { className: "cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200", children: "Ver detalhes t\u00E9cnicos" }), _jsx("pre", { className: "mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-md overflow-x-auto", children: JSON.stringify(log.payload, null, 2) })] }) }))] }));
}

import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Trash2 } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { LogItem } from '../components/LogItem';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { LogFilter } from '../components/LogFilter';
const API_URL = import.meta.env.VITE_API_URL;
export function Logs() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentFilters, setCurrentFilters] = useState({
        search: '',
        startDate: '',
        endDate: '',
        type: 'order'
    });
    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('session');
            if (!token) {
                navigate('/login');
                return;
            }
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
            const response = await fetch(`${API_URL}/api/logs`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                // Adicionar o erro aos logs
                const errorLog = {
                    id: Date.now().toString(),
                    type: 'system',
                    action: 'error',
                    status: 'error',
                    message: `Erro ao carregar logs: ${response.statusText}`,
                    timestamp: new Date().toISOString(),
                    metadata: {
                        errorCode: response.status,
                        originalError: await response.text().catch(() => 'Não foi possível obter detalhes do erro')
                    }
                };
                setLogs(prevLogs => [errorLog, ...prevLogs]);
                throw new Error(t.errors.errorLoadingBalances);
            }
            const data = await response.json();
            if (data.success && Array.isArray(data.logs)) {
                setLogs(data.logs);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                // Adicionar o erro aos logs
                const errorLog = {
                    id: Date.now().toString(),
                    type: 'system',
                    action: 'error',
                    status: 'error',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    metadata: {
                        originalError: error.stack || error.message,
                        errorCode: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR'
                    }
                };
                setLogs(prevLogs => [errorLog, ...prevLogs]);
                if (error.name === 'AbortError') {
                    console.warn('Requisição de logs cancelada por timeout');
                    return;
                }
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    console.warn('Erro de rede ao carregar logs - tentando novamente em 5 segundos');
                    return;
                }
                console.error('Erro ao carregar logs:', error.message);
                toast.error(error.message);
            }
            else {
                // Adicionar erro desconhecido aos logs
                const errorLog = {
                    id: Date.now().toString(),
                    type: 'system',
                    action: 'error',
                    status: 'error',
                    message: 'Erro desconhecido ao carregar logs',
                    timestamp: new Date().toISOString(),
                    metadata: {
                        originalError: error
                    }
                };
                setLogs(prevLogs => [errorLog, ...prevLogs]);
                console.error('Erro desconhecido ao carregar logs:', error);
                toast.error(t.errors.generalError);
            }
        }
        finally {
            setLoading(false);
        }
    };
    // Limpar logs
    const clearLogs = async () => {
        try {
            const token = localStorage.getItem('session');
            if (!token) {
                navigate('/login');
                return;
            }
            const response = await fetch(`${API_URL}/api/logs/clear`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(t.errors.generalError);
            }
            const data = await response.json();
            if (data.success) {
                setLogs([]);
                toast.success(t.success.botUpdated);
            }
        }
        catch (error) {
            console.error('Erro ao limpar logs:', error);
            toast.error(error instanceof Error ? error.message : t.errors.generalError);
        }
    };
    const handleFilterChange = (filters) => {
        setCurrentFilters(filters);
        applyFilters(logs, filters);
    };
    const applyFilters = (logsToFilter, filters) => {
        let filtered = [...logsToFilter];
        // Filtrar por texto (nome do bot ou ID)
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(log => log.bot?.name?.toLowerCase().includes(search) ||
                log.bot?.public_id?.toLowerCase().includes(search) ||
                log.payload?.public_id?.toLowerCase().includes(search));
        }
        // Filtrar por tipo
        if (filters.type && filters.type !== 'all') {
            filtered = filtered.filter(log => {
                switch (filters.type) {
                    case 'webhook':
                        return log.type === 'webhook_received' || log.type === 'webhook_error';
                    case 'system':
                        return log.action === 'system';
                    case 'order':
                        return log.type === 'webhook_executed' || log.type === 'webhook_processed';
                    case 'test':
                        return log.action === 'test' || log.message?.toLowerCase().includes('teste');
                    case 'error':
                        return log.status === 'error';
                    default:
                        return true;
                }
            });
        }
        // Filtrar por data
        if (filters.startDate) {
            filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
        }
        // Ordenar por data (mais recente primeiro)
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setFilteredLogs(filtered);
    };
    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, [navigate]);
    // Atualizar filtros quando novos logs chegarem
    useEffect(() => {
        applyFilters(logs, currentFilters);
    }, [logs]);
    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return _jsx(CheckCircle2, { className: "w-5 h-5 text-green-500" });
            case 'error':
                return _jsx(AlertCircle, { className: "w-5 h-5 text-red-500" });
            case 'warning':
                return _jsx(AlertTriangle, { className: "w-5 h-5 text-yellow-500" });
            default:
                return _jsx(Info, { className: "w-5 h-5 text-blue-500" });
        }
    };
    const getStatusClass = (status) => {
        switch (status) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
            default:
                return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
        }
    };
    const formatDetails = (details) => {
        if (details.includes('Payload:')) {
            const [message, payload] = details.split('Payload:');
            try {
                const jsonPayload = JSON.parse(payload);
                return (_jsxs(_Fragment, { children: [_jsx("p", { className: "mb-2", children: message }), _jsx("pre", { className: "bg-gray-50 dark:bg-gray-900/50 p-2 rounded-md overflow-x-auto text-sm", children: JSON.stringify(jsonPayload, null, 2) })] }));
            }
            catch {
                return details;
            }
        }
        return details;
    };
    return (_jsxs("div", { className: "container mx-auto p-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-indigo-100", children: t.logs.title }), _jsxs(Button, { variant: "destructive", size: "sm", onClick: clearLogs, disabled: loading || logs.length === 0, className: "bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600", children: [_jsx(Trash2, { className: "w-4 h-4 mr-2" }), t.logs.clearLogs] })] }), _jsx(LogFilter, { onFilterChange: handleFilterChange }), loading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-indigo-500 mx-auto" }), _jsx("p", { className: "mt-2 text-gray-600 dark:text-indigo-300", children: t.logs.loading })] })) : filteredLogs.length === 0 ? (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-600 dark:text-indigo-300", children: t.logs.noLogs }) })) : (_jsx("div", { className: "space-y-4", children: filteredLogs.map((log) => (_jsx(LogItem, { log: log }, log.id))) }))] }));
}

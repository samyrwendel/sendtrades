import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { LogItem } from '../components/LogItem';
import { toast } from 'sonner';
import { BotLog } from '../lib/types';
import { supabaseAdmin } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogFilter, LogFilters } from '../components/LogFilter';
import { PageLayout, PageHeader, PageContent } from "../components/ui/page-layout";
import { themeClasses } from "../lib/theme/colors";
import { EmptyState } from "../components/ui/data-table";
import { cn } from '../lib/utils';
import { UpdateIndicator } from "../components/ui/update-indicator";
import { ThemePageHeader, ThemeUpdateButton } from '../components/ui';

const API_URL = import.meta.env.VITE_API_URL;

export function Logs() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<BotLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [currentFilters, setCurrentFilters] = useState<LogFilters>({
    search: '',
    startDate: '',
    endDate: '',
    type: 'order',
    dateRange: 'all'
  });
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [clearError, setClearError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('session');
      if (!token) {
        navigate('/login');
        return;
      }

      setIsRefreshing(true);
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
        const errorLog: BotLog = {
          id: Date.now().toString(),
          type: 'system',
          action: 'error',
          status: 'error',
          message: `Erro ao carregar logs: ${response.statusText}`,
          timestamp: new Date(),
          metadata: {
            errorCode: response.status,
            originalError: await response.text().catch(() => 'Não foi possível obter detalhes do erro')
          }
        };
        setLogs(prevLogs => [errorLog, ...prevLogs]);
        setClearError(t.errors.errorLoadingBalances);
        throw new Error(t.errors.errorLoadingBalances);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
        setLastUpdate(new Date());
      }
    } catch (error) {
      if (error instanceof Error) {
        // Adicionar o erro aos logs
        const errorLog: BotLog = {
          id: Date.now().toString(),
          type: 'system',
          action: 'error',
          status: 'error',
          message: error.message,
          timestamp: new Date(),
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
        setClearError(error.message);
      } else {
        // Adicionar erro desconhecido aos logs
        const errorLog: BotLog = {
          id: Date.now().toString(),
          type: 'system',
          action: 'error',
          status: 'error',
          message: 'Erro desconhecido ao carregar logs',
          timestamp: new Date(),
          metadata: {
            originalError: error
          }
        };
        setLogs(prevLogs => [errorLog, ...prevLogs]);
        
        console.error('Erro desconhecido ao carregar logs:', error);
        toast.error(t.errors.generalError);
        setClearError(t.errors.generalError);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
      toast.error(error instanceof Error ? error.message : t.errors.generalError);
    }
  };

  const handleFilterChange = (filters: LogFilters) => {
    setCurrentFilters(filters);
    applyFilters(logs, filters);
  };

  const applyFilters = (logsToFilter: BotLog[], filters: LogFilters) => {
    let filtered = [...logsToFilter];

    // Filtrar por texto de pesquisa
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log =>
        (log.bot?.name?.toLowerCase().includes(searchLower)) ||
        (log.bot?.public_id?.toLowerCase().includes(searchLower)) ||
        (log.payload?.public_id?.toLowerCase().includes(searchLower)) ||
        (log.message?.toLowerCase().includes(searchLower))
      );
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
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate;
      });
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate <= endDate;
      });
    }

    // Ordenar por data (mais recente primeiro)
    filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusClass = (status: string) => {
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

  const formatDetails = (details: string) => {
    if (details.includes('Payload:')) {
      const [message, payload] = details.split('Payload:');
      try {
        const jsonPayload = JSON.parse(payload);
        return (
          <>
            <p className="mb-2">{message}</p>
            <pre className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-md overflow-x-auto text-sm">
              {JSON.stringify(jsonPayload, null, 2)}
            </pre>
          </>
        );
      } catch {
        return details;
      }
    }
    return details;
  };

  const handleRefresh = () => {
    if (!isRefreshing) {
      fetchLogs();
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedLog(expandedLog === id ? null : id);
  };

  return (
    <PageLayout>
      <ThemePageHeader title={t.logs.title}>
        {clearError && (
          <div className="text-sm text-[var(--md-error)] dark:text-[var(--md-error-light)] mr-2">
            {clearError}
          </div>
        )}
        
        <ThemeUpdateButton 
          isUpdating={isRefreshing}
          onClick={handleRefresh}
          className="mr-2"
        />
        
        <Button
          onClick={clearLogs}
          disabled={loading || logs.length === 0}
          variant="destructive"
          className="ml-auto"
          size="sm"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {t.logs.clearLogs}
        </Button>
      </ThemePageHeader>

      <PageContent>
        <LogFilter onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-lg text-gray-600 dark:text-gray-300">
              {t.common.loading}...
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState message={t.logs.noLogsFound} />
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <LogItem
                key={log.id}
                log={log}
                expanded={expandedLog === log.id}
                onToggle={() => handleToggleExpand(log.id)}
              />
            ))}
          </div>
        )}
      </PageContent>
    </PageLayout>
  );
}
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpCircle, ArrowDownCircle, AlertTriangle, Info, CheckCircle2, Clock, Calculator, ChevronUp, ChevronDown } from 'lucide-react';
import { BotLog } from '../lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '../lib/utils';
import { themeClasses } from "../lib/theme/colors";

interface LogItemProps {
  log: BotLog;
  expanded?: boolean;
  onToggle?: () => void;
}

interface Warning {
  message: string;
  details?: {
    calculatedAmount: number;
    unit: string;
  };
}

export function LogItem({ log, expanded = false, onToggle }: LogItemProps) {
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
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
    
    switch (log.action) {
      case 'buy':
        return <ArrowUpCircle className="w-5 h-5 text-green-500" />;
      case 'sell':
        return <ArrowDownCircle className="w-5 h-5 text-red-500" />;
      case 'validate':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'process':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
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
  const formatStatus = (status: string) => {
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
  const formatTimestamp = (timestamp: string | Date) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return format(date, "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };

  // Função para obter o ícone do status
  const getStatusIcon = () => {
    switch (log.status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'processing':
        return <Clock className="w-5 h-5" />;
      case 'calculated':
        return <Calculator className="w-5 h-5" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  // Verificar se há avisos no metadata
  const hasWarnings = log.metadata?.warnings && log.metadata.warnings.length > 0;

  const formatDetails = (json: string) => {
    try {
      return json;
    } catch (e) {
      return json;
    }
  };

  return (
    <div className={cn(
      "border rounded-lg p-4 shadow-sm",
      getCardStyle(),
      themeClasses.card.base
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div>
            <h3 className="text-lg font-semibold">{log.message}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatTimestamp(log.timestamp)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusBadgeStyle()}`}>
            {getStatusIcon()}
            {formatStatus(log.status)}
          </span>
          
          {(log.metadata || log.payload) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="ml-2"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Avisos */}
      {hasWarnings && (
        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
          {log.metadata.warnings.map((warning: Warning, index: number) => (
            <div key={index} className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">{warning.message}</p>
                {warning.details && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    Valor calculado: {warning.details.calculatedAmount.toFixed(2)} {warning.details.unit}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detalhes do log */}
      {log.details && (
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {log.details.split('\n').map((line, index) => (
            <p key={index} className="whitespace-pre-wrap">{line.trim()}</p>
          ))}
        </div>
      )}

      {/* Metadados expandidos */}
      {expanded && log.metadata && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[var(--md-surface-4)]">
          <h4 className={cn("text-sm font-medium mb-2", themeClasses.text.primary)}>
            Detalhes
          </h4>
          <pre className="text-xs bg-gray-50 dark:bg-[var(--md-surface-2)] p-3 rounded overflow-auto max-h-[200px]">
            {formatDetails(JSON.stringify(log.metadata, null, 2))}
          </pre>
        </div>
      )}

      {/* Payload (se existir e for relevante) */}
      {expanded && log.payload && (
        <div className="mt-3">
          <h4 className={cn("text-sm font-medium mb-2", themeClasses.text.primary)}>
            Payload
          </h4>
          <pre className="text-xs bg-gray-50 dark:bg-[var(--md-surface-2)] p-3 rounded overflow-auto max-h-[200px]">
            {JSON.stringify(log.payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 
import React, { useState } from 'react';
import { Bot } from '../lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Badge, Button } from '../components/ui';
import { Trash2, Play, Pause, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../lib/i18n/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { colors } from '../lib/theme/colors';

const API_URL = import.meta.env.VITE_API_URL;

interface BotCardProps {
  bot: Bot;
  onDelete?: () => void;
  onToggle?: () => void;
  onEdit?: () => void;
}

// Lista de Quote Assets conhecidos em ordem de prioridade
const KNOWN_QUOTE_ASSETS = [
  'USDT',  // Mais comum, verificar primeiro
  'USDC',
  'TUSD',
  'BUSD',
  'EUR',
  'BTC',
  'ETH'
];

function extractAssetsFromTicker(ticker: string): { baseAsset: string; quoteAsset: string } {
  if (!ticker || typeof ticker !== 'string') {
    return { baseAsset: 'N/A', quoteAsset: 'N/A' };
  }

  // Converter ticker para maiúsculo para comparação
  const upperTicker = ticker.toUpperCase();

  // Tentar encontrar um Quote Asset conhecido no final do ticker
  for (const quote of KNOWN_QUOTE_ASSETS) {
    if (upperTicker.endsWith(quote)) {
      const base = upperTicker.slice(0, -quote.length);
      if (base.length > 0) {
        return { baseAsset: base, quoteAsset: quote };
      }
    }
  }

  return { baseAsset: 'N/A', quoteAsset: 'N/A' };
}

export function BotCard({ 
  bot, 
  onDelete, 
  onToggle, 
  onEdit
}: BotCardProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const { baseAsset, quoteAsset } = extractAssetsFromTicker(bot.tradingPair);
  const hasCredentials = Boolean(bot.exchange?.config?.credentials?.apiKey && bot.exchange?.config?.credentials?.secretKey);
  const status = bot.enabled ? t.bots.active : t.bots.paused;

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsLoading(true);
    try {
      await onDelete();
      toast.success(t.success.botDeleted);
    } catch (error) {
      console.error('Error deleting bot:', error);
      toast.error(t.errors.failedToDeleteBot);
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleToggle = async () => {
    if (!onToggle) return;
    setIsLoading(true);
    try {
      await onToggle();
      toast.success(bot.enabled ? t.success.botPaused : t.success.botActivated);
    } catch (error) {
      console.error('Error toggling bot:', error);
      toast.error(t.errors.generalError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!onEdit) return;
    onEdit();
  };

  return (
    <Card className="flex flex-col h-full bg-white dark:bg-[var(--md-surface-1)] border border-gray-200 dark:border-[var(--md-surface-4)] hover:shadow-lg transition-all duration-200">
      <div className="p-3">
        {/* Cabeçalho do Card */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base text-gray-900 dark:text-[var(--md-on-surface)] truncate">
                {bot.name}
              </CardTitle>
              <Badge variant={bot.enabled ? "success" : "warning"} className={`text-xs px-2 py-0.5 ${
                bot.enabled 
                ? "bg-[#0AD85E]/10 text-[#0AD85E] dark:bg-[#050505] dark:text-[#0AD85E]" 
                : "bg-amber-100 text-amber-700 dark:bg-[#050505] dark:text-amber-400"
              }`}>
                {status}
              </Badge>
            </div>
            {hasCredentials ? (
              <div className="text-xs text-gray-500 dark:text-[var(--md-on-surface-medium)] mt-1 font-mono">
                API: {bot.exchange?.config?.credentials?.apiKey.slice(0, 4)}...{bot.exchange?.config?.credentials?.apiKey.slice(-4)}
              </div>
            ) : (
              <div className="text-xs text-[var(--md-error)] dark:text-[var(--md-error-light)] mt-1">
                {t.bots.noCredentials}
              </div>
            )}
            <CardDescription className="text-xs text-gray-500 dark:text-[var(--md-on-surface-medium)] mt-0.5">
              ID: {bot.public_id}
            </CardDescription>
          </div>
          <div className="flex items-start gap-1 shrink-0">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleEdit} 
              disabled={isLoading} 
              className="h-7 w-7 bg-white hover:bg-gray-50 dark:bg-[var(--md-surface-2)] dark:hover:bg-[var(--md-surface-3)] text-[var(--md-primary)] hover:text-[var(--md-primary-dark)] dark:text-[var(--md-primary-light)] dark:hover:text-[var(--md-primary)] border-gray-200 hover:border-gray-300 dark:border-[var(--md-surface-4)] dark:hover:border-[var(--md-surface-5)]"
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleToggle} 
              disabled={isLoading} 
              className={`h-7 w-7 bg-white hover:bg-gray-50 dark:bg-[var(--md-surface-2)] dark:hover:bg-[var(--md-surface-3)] border-gray-200 hover:border-gray-300 dark:border-[var(--md-surface-4)] dark:hover:border-[var(--md-surface-5)] ${
                bot.enabled 
                  ? "text-[var(--md-warning)] hover:text-[var(--md-warning-dark)] dark:text-[var(--md-warning-light)] dark:hover:text-[var(--md-warning)]" 
                  : "text-[var(--md-success)] hover:text-[var(--md-success-dark)] dark:text-[var(--md-success-light)] dark:hover:text-[var(--md-success)]"
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
              ) : bot.enabled ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setShowDeleteDialog(true)} 
              disabled={isLoading} 
              className="h-7 w-7 bg-white hover:bg-gray-50 dark:bg-[var(--md-surface-2)] dark:hover:bg-[var(--md-surface-3)] text-[var(--md-error)] hover:text-[var(--md-error-dark)] dark:text-[var(--md-error-light)] dark:hover:text-[var(--md-error)] border-gray-200 hover:border-gray-300 dark:border-[var(--md-surface-4)] dark:hover:border-[var(--md-surface-5)]"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Informações de Trading */}
        <div className="grid grid-cols-2 gap-2 text-xs mt-3">
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-[var(--md-on-surface-medium)]">{t.bots.tradingPair}</div>
            <div className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-[var(--md-on-surface)]">
              {baseAsset}/{quoteAsset}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-gray-500 dark:text-[var(--md-on-surface-medium)]">{t.bots.exchange}</div>
            <div className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-[var(--md-on-surface)]">
              {bot.exchange?.name || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-[var(--md-surface-2)] border border-gray-200 dark:border-[var(--md-surface-4)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-[var(--md-on-surface)]">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-[var(--md-on-surface-medium)]">
              Tem certeza que deseja excluir o bot "{bot.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isLoading} 
              className="bg-white hover:bg-gray-50 dark:bg-[var(--md-surface-2)] dark:hover:bg-[var(--md-surface-3)] text-gray-800 dark:text-[var(--md-on-surface)] border border-gray-300 dark:border-[var(--md-surface-4)]"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isLoading}
              className="bg-[var(--md-error)] hover:bg-[var(--md-error-dark)] text-white dark:bg-[var(--md-error)] dark:hover:bg-[var(--md-error-dark)] shadow-lg hover:shadow-xl"
            >
              {isLoading ? "Excluindo..." : "Excluir Bot"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
} 
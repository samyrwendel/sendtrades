import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardDescription, CardTitle, Badge, Button } from '../components/ui';
import { Trash2, Play, Pause, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
const API_URL = import.meta.env.VITE_API_URL;
export function BotCard({ bot, onDelete, onToggle, onEdit }) {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const navigate = useNavigate();
    const baseAsset = bot.exchange?.config?.tradingInfo?.baseAsset || 'N/A';
    const quoteAsset = bot.exchange?.config?.tradingInfo?.quoteAsset || 'N/A';
    const status = bot.enabled ? 'Ativo' : 'Pausado';
    const hasCredentials = bot.exchange?.config?.credentials?.apiKey && bot.exchange?.config?.credentials?.secretKey;
    const handleDelete = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('session');
            if (!token) {
                toast.error(t.errors.sessionExpired);
                navigate('/login');
                return;
            }
            const response = await fetch(`${API_URL}/api/bots/${bot.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(t.errors.failedToDeleteBot);
            }
            toast.success(t.success.botDeleted);
            onDelete?.();
        }
        catch (error) {
            console.error('Erro ao excluir bot:', error);
            toast.error(error instanceof Error ? error.message : t.errors.generalError);
        }
        finally {
            setIsLoading(false);
            setShowDeleteDialog(false);
        }
    };
    const handleToggle = async () => {
        try {
            const token = localStorage.getItem('session');
            if (!token) {
                toast.error(t.errors.sessionExpired);
                navigate('/login');
                return;
            }
            if (isLoading) {
                return; // Evitar múltiplos cliques
            }
            setIsLoading(true);
            console.log('🔄 Iniciando toggle do bot:', {
                id: bot.id,
                enabled: bot.enabled
            });
            if (typeof onToggle === 'function') {
                await onToggle();
            }
            console.log('✅ Toggle concluído');
        }
        catch (error) {
            console.error('❌ Erro ao alternar status do bot:', error);
            toast.error(error instanceof Error ? error.message : t.errors.generalError);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleEdit = () => {
        navigate(`/bots/${bot.id}`, {
            state: {
                mode: 'edit',
                botData: bot
            }
        });
    };
    return (_jsxs(Card, { className: "flex flex-col h-full bg-white dark:bg-[#020817] dark:backdrop-blur border-gray-100 dark:border-indigo-800/30 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "p-4 flex-1", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx(CardTitle, { className: "text-xl text-gray-900 dark:text-indigo-100 truncate", children: bot.name }), _jsxs(CardDescription, { className: "text-sm text-gray-500 dark:text-indigo-300/70", children: ["ID: ", bot.public_id] })] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: handleEdit, disabled: isLoading, className: "text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 border-indigo-200 hover:border-indigo-300 dark:border-[#020817] dark:hover:border-indigo-700 dark:bg-[#020817]/80", children: _jsx(Settings, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "icon", onClick: handleToggle, disabled: isLoading, className: bot.enabled ? "text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 border-amber-200 hover:border-amber-300 dark:border-[#020817] dark:hover:border-amber-700 dark:bg-[#020817]/80" : "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 border-emerald-200 hover:border-emerald-300 dark:border-[#020817] dark:hover:border-emerald-700 dark:bg-[#020817]/80", children: isLoading ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-current" })) : bot.enabled ? (_jsx(Pause, { className: "h-4 w-4" })) : (_jsx(Play, { className: "h-4 w-4" })) }), _jsx(Button, { variant: "outline", size: "icon", onClick: () => setShowDeleteDialog(true), disabled: isLoading, className: "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-red-200 hover:border-red-300 dark:border-[#020817] dark:hover:border-red-700 dark:bg-[#020817]/80", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }), _jsx(Badge, { variant: bot.enabled ? "success" : "warning", className: `mb-4 ${bot.enabled ? "bg-emerald-100 text-emerald-700 dark:bg-[#020817] dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-[#020817] dark:text-amber-400"}`, children: status }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-muted-foreground dark:text-gray-400", children: t.bots.tradingPair }), _jsxs("div", { className: "text-lg font-semibold mt-1 dark:text-gray-100", children: [baseAsset, "/", quoteAsset] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs text-muted-foreground dark:text-gray-400", children: t.trading.base }), _jsx("div", { className: "text-sm font-semibold mt-1 dark:text-gray-100", children: baseAsset })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-muted-foreground dark:text-gray-400", children: t.trading.quote }), _jsx("div", { className: "text-sm font-semibold mt-1 dark:text-gray-100", children: quoteAsset })] })] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-muted-foreground dark:text-gray-400", children: t.bots.exchange }), _jsxs("div", { className: "text-lg font-semibold mt-1 dark:text-gray-100", children: [bot.exchange?.name || 'N/A', !hasCredentials && (_jsx("div", { className: "mt-2 text-sm text-red-500", children: t.bots.noCredentials }))] })] })] })] }), _jsx(AlertDialog, { open: showDeleteDialog, onOpenChange: setShowDeleteDialog, children: _jsxs(AlertDialogContent, { className: "bg-white dark:bg-[#020817] border border-gray-200 dark:border-gray-700", children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { className: "text-gray-900 dark:text-gray-100", children: "Confirmar Exclus\u00E3o" }), _jsxs(AlertDialogDescription, { className: "text-gray-600 dark:text-gray-400", children: ["Tem certeza que deseja excluir o bot \"", bot.name, "\"? Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { disabled: isLoading, className: "bg-white hover:bg-gray-100 text-gray-800 dark:bg-[#020817] dark:hover:bg-[#020817]/80 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600", children: "Cancelar" }), _jsx(AlertDialogAction, { onClick: handleDelete, disabled: isLoading, className: "bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 shadow-lg hover:shadow-xl", children: isLoading ? "Excluindo..." : "Excluir Bot" })] })] }) })] }));
}

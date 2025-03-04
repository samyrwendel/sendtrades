import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Button } from '../components/ui';
import { BotCard } from '../components/BotCard';
import { toast } from 'sonner';
const API_URL = import.meta.env.VITE_API_URL;
export function MyBots() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [bots, setBots] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    // Cache de bots ativos e pausados usando useMemo
    const { activeBots, pausedBots } = useMemo(() => {
        console.log('🤖 Processando bots:', {
            total: bots.length,
            bots: bots.map(b => ({
                id: b.id,
                name: b.name,
                enabled: Boolean(b.enabled)
            }))
        });
        // Forçar conversão para boolean e garantir que true === true
        const active = bots.filter(bot => {
            const isEnabled = Boolean(bot.enabled);
            console.log(`Bot ${bot.name} (${bot.id}): enabled = ${isEnabled}`);
            return isEnabled === true;
        });
        const paused = bots.filter(bot => {
            const isEnabled = Boolean(bot.enabled);
            return isEnabled === false;
        });
        console.log('📊 Resultado do processamento:', {
            ativos: active.length,
            pausados: paused.length,
            detalhesAtivos: active.map(b => ({
                id: b.id,
                name: b.name,
                enabled: Boolean(b.enabled)
            })),
            detalhesPausados: paused.map(b => ({
                id: b.id,
                name: b.name,
                enabled: Boolean(b.enabled)
            }))
        });
        return {
            activeBots: active,
            pausedBots: paused
        };
    }, [bots]);
    // Buscar bots do servidor
    const fetchBots = async () => {
        try {
            const token = localStorage.getItem('session');
            if (!token) {
                toast.error(t.errors.sessionExpired);
                navigate('/login');
                return;
            }
            console.log('🔄 Buscando bots...');
            const response = await fetch(`${API_URL}/api/bots`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(t.errors.failedToLoadBots);
            }
            const data = await response.json();
            console.log('📊 Dados recebidos da API:', {
                total: data.length,
                bots: data.map(b => ({
                    id: b.id,
                    name: b.name,
                    enabled: Boolean(b.enabled)
                }))
            });
            if (Array.isArray(data)) {
                // Garantir que todos os bots tenham a propriedade enabled como boolean
                const processedBots = data.map(bot => ({
                    ...bot,
                    enabled: Boolean(bot.enabled)
                }));
                console.log('🤖 Bots processados:', {
                    total: processedBots.length,
                    ativos: processedBots.filter(b => b.enabled === true).length,
                    pausados: processedBots.filter(b => b.enabled === false).length,
                    detalhes: processedBots.map(b => ({
                        id: b.id,
                        name: b.name,
                        enabled: b.enabled
                    }))
                });
                setBots(processedBots);
            }
            else {
                console.error('❌ Formato de dados inválido:', data);
                throw new Error('Formato de dados inválido');
            }
        }
        catch (error) {
            console.error('❌ Erro ao carregar bots:', error);
            setError(error instanceof Error ? error.message : t.errors.generalError);
            toast.error(t.errors.failedToLoadBots);
        }
        finally {
            setInitialLoading(false);
        }
    };
    // Atualizar lista de bots periodicamente
    useEffect(() => {
        fetchBots();
        const interval = setInterval(fetchBots, 5000); // Atualiza a cada 5 segundos
        return () => clearInterval(interval);
    }, [navigate, t.errors.failedToLoadBots, t.errors.generalError]);
    const handleCreateBot = () => {
        navigate('/new-bots');
    };
    const handleDeleteBot = async (botId) => {
        try {
            const token = localStorage.getItem('session');
            if (!token) {
                navigate('/login');
                return;
            }
            const response = await fetch(`${API_URL}/api/bots/${botId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(t.errors.failedToDeleteBot);
            }
            await fetchBots(); // Recarrega a lista após deletar
            toast.success(t.success.botDeleted);
        }
        catch (error) {
            console.error('❌ Erro ao deletar bot:', error);
            toast.error(t.errors.failedToDeleteBot);
        }
    };
    const handleToggleBot = async (botId) => {
        try {
            const token = localStorage.getItem('session');
            if (!token) {
                navigate('/login');
                return;
            }
            console.log('🔄 Alternando estado do bot:', botId);
            const response = await fetch(`${API_URL}/api/bots/${botId}/toggle`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            console.log('📊 Resposta do toggle:', data);
            if (!response.ok) {
                throw new Error(data.message || 'Erro ao alternar status do bot');
            }
            if (data.success) {
                // Atualizar o estado local do bot
                setBots(prevBots => prevBots.map(bot => bot.id === botId
                    ? { ...bot, enabled: !bot.enabled }
                    : bot));
                console.log('✅ Bot atualizado com sucesso');
                toast.success(data.bot.enabled ? t.success.botActivated : t.success.botPaused);
            }
            else {
                throw new Error(data.message || 'Erro ao alternar status do bot');
            }
        }
        catch (error) {
            console.error('❌ Erro ao alternar status do bot:', error);
            toast.error(error instanceof Error ? error.message : t.errors.generalError);
        }
    };
    if (initialLoading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: _jsxs("div", { className: "text-lg text-gray-600 dark:text-gray-300", children: [t.common.loading, "..."] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: _jsx("div", { className: "text-lg text-red-600 dark:text-red-400", children: error }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-900 dark:text-white", children: t.dashboard.myBots }), _jsxs(Button, { onClick: handleCreateBot, className: "flex items-center bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600", children: [_jsx(Plus, { className: "w-5 h-5 mr-2" }), t.bots.createBot] })] }), _jsxs("div", { children: [_jsxs("h2", { className: "text-lg font-medium text-gray-900 dark:text-white mb-4", children: [t.bots.active, " (", activeBots.length, ")"] }), activeBots.length > 0 ? (_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: activeBots.map(bot => {
                            console.log('🤖 Renderizando bot ativo:', bot);
                            return (_jsx(BotCard, { bot: bot, onDelete: () => handleDeleteBot(bot.id), onToggle: () => handleToggleBot(bot.id), onEdit: () => navigate(`/bots/${bot.id}`) }, bot.id));
                        }) })) : (_jsx("div", { className: "text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg", children: t.bots.noActiveBots }))] }), _jsxs("div", { children: [_jsxs("h2", { className: "text-lg font-medium text-gray-900 dark:text-white mb-4", children: [t.bots.paused, " (", pausedBots.length, ")"] }), pausedBots.length > 0 ? (_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: pausedBots.map(bot => {
                            console.log('🤖 Renderizando bot pausado:', bot);
                            return (_jsx(BotCard, { bot: bot, onDelete: () => handleDeleteBot(bot.id), onToggle: () => handleToggleBot(bot.id), onEdit: () => navigate(`/bots/${bot.id}`) }, bot.id));
                        }) })) : (_jsx("div", { className: "text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg", children: t.bots.noPausedBots }))] })] }));
}

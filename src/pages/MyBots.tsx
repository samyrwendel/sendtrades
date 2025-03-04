import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Bot } from '../lib/types';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui';
import { BotCard } from '../components/BotCard';
import { toast } from 'sonner';
import { PageLayout, PageFilterSection, PageContent, PageSection } from "../components/ui/page-layout";
import { SearchInput } from "../components/ui/search-input";
import { themeClasses } from "../lib/theme/colors";
import { UpdateIndicator } from "../components/ui/update-indicator";
import { Card, CardContent, CardHeader, CardTitle, FilterButton, ThemeSearchInput, ThemeUpdateButton, ThemePageHeader } from '../components/ui';
import { Bot as BotIcon, Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export function MyBots() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [bots, setBots] = useState<Bot[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [dateFilter, setDateFilter] = useState('all');

  // Cache de bots filtrados usando useMemo
  const filteredBots = useMemo(() => {
    return bots.filter(bot => {
      // Filtro por texto (nome ou ID)
      const searchMatch = searchTerm.toLowerCase().trim() === '' ||
        bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bot.public_id && bot.public_id.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro por status
      const statusMatch = statusFilter === 'all' ||
        (statusFilter === 'active' && bot.enabled) ||
        (statusFilter === 'paused' && !bot.enabled);

      return searchMatch && statusMatch;
    });
  }, [bots, searchTerm, statusFilter]);

  // Separar bots ativos e pausados do resultado filtrado
  const { activeBots, pausedBots } = useMemo(() => {
    const active = filteredBots.filter((bot: Bot) => Boolean(bot.enabled) === true);
    const paused = filteredBots.filter((bot: Bot) => Boolean(bot.enabled) === false);
    return { activeBots: active, pausedBots: paused };
  }, [filteredBots]);

  // Buscar bots do servidor
  const fetchBots = async () => {
    try {
      const token = localStorage.getItem('session');
      if (!token) {
        toast.error(t.errors.sessionExpired);
        navigate('/login');
        return;
      }

      setIsRefreshing(true);
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
        bots: data.map((b: any) => ({
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
        setLastUpdate(new Date());
      } else {
        console.error('❌ Formato de dados inválido:', data);
        throw new Error('Formato de dados inválido');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar bots:', error);
      setError(error instanceof Error ? error.message : t.errors.generalError);
      toast.error(t.errors.failedToLoadBots);
    } finally {
      setInitialLoading(false);
      setIsRefreshing(false);
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

  const handleDeleteBot = async (botId: string) => {
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
    } catch (error) {
      console.error('❌ Erro ao deletar bot:', error);
      toast.error(t.errors.failedToDeleteBot);
    }
  };

  const handleToggleBot = async (botId: string) => {
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
        setBots(prevBots => 
          prevBots.map(bot => 
            bot.id === botId 
              ? { ...bot, enabled: !bot.enabled }
              : bot
          )
        );

        console.log('✅ Bot atualizado com sucesso');
        toast.success(data.bot.enabled ? t.success.botActivated : t.success.botPaused);
      } else {
        throw new Error(data.message || 'Erro ao alternar status do bot');
      }
    } catch (error) {
      console.error('❌ Erro ao alternar status do bot:', error);
      toast.error(error instanceof Error ? error.message : t.errors.generalError);
    }
  };

  const handleRefresh = () => {
    if (!isRefreshing) {
      fetchBots();
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600 dark:text-gray-300">
          {t.common.loading}...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <ThemePageHeader title="Meus Bots">
        <Button 
          onClick={handleCreateBot} 
          variant="success" 
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t.bots.createBot}
        </Button>
      </ThemePageHeader>

      {/* Filtros */}
      <PageFilterSection>
        <div className="w-full flex flex-col md:flex-row gap-2 md:gap-4">
          <ThemeSearchInput
            placeholder="Buscar por nome ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:flex-1"
          />
          <div className="flex w-full md:w-auto gap-2 md:gap-4 justify-center">
            <FilterButton
              icon={BotIcon}
              label="Todos os Bots"
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'paused')}
              options={[
                { value: 'all', label: "Todos os Bots" },
                { value: 'active', label: "Bots Ativos" },
                { value: 'paused', label: "Bots Pausados" }
              ]}
            />
            <FilterButton
              icon={Calendar}
              label="Todas as Datas"
              value={dateFilter}
              onValueChange={(value) => setDateFilter(value)}
              options={[
                { value: 'all', label: "Todas as Datas" },
                { value: 'today', label: "Hoje" },
                { value: 'week', label: "Última semana" },
                { value: 'month', label: "Último mês" }
              ]}
            />
          </div>
        </div>
      </PageFilterSection>

      <PageContent>
        {/* Bots Ativos */}
        <PageSection title={`${t.bots.active} (${activeBots.length})`}>
          {activeBots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeBots.map((bot) => (
                <BotCard
                  key={bot.id}
                  bot={bot}
                  onDelete={() => handleDeleteBot(bot.id)}
                  onToggle={() => handleToggleBot(bot.id)}
                  onEdit={() => navigate(`/bots/${bot.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-[var(--md-on-surface-medium)] p-4 bg-gray-50 dark:bg-[var(--md-surface-2)] rounded-lg">
              {searchTerm || statusFilter !== 'all' ? 'Nenhum bot encontrado com os filtros atuais' : t.bots.noActiveBots}
            </div>
          )}
        </PageSection>

        {/* Bots Pausados */}
        <PageSection title={`${t.bots.paused} (${pausedBots.length})`}>
          {pausedBots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pausedBots.map((bot) => (
                <BotCard
                  key={bot.id}
                  bot={bot}
                  onDelete={() => handleDeleteBot(bot.id)}
                  onToggle={() => handleToggleBot(bot.id)}
                  onEdit={() => navigate(`/bots/${bot.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-[var(--md-on-surface-medium)] p-4 bg-gray-50 dark:bg-[var(--md-surface-2)] rounded-lg">
              {searchTerm || statusFilter !== 'all' ? 'Nenhum bot encontrado com os filtros atuais' : t.bots.noPausedBots}
            </div>
          )}
        </PageSection>
      </PageContent>
    </PageLayout>
  );
}
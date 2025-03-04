import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useBotStore = create()(persist((set) => ({
    bots: [],
    addBot: (bot) => set((state) => {
        // Dispara evento de atualização
        window.dispatchEvent(new Event('botsUpdated'));
        return { bots: [...state.bots, bot] };
    }),
    updateBot: (id, updatedBot) => set((state) => {
        const newBots = state.bots.map((bot) => bot.id === id ? updatedBot : bot);
        // Dispara evento de atualização
        window.dispatchEvent(new Event('botsUpdated'));
        return { bots: newBots };
    }),
    deleteBot: (id) => set((state) => {
        const newBots = state.bots.filter((bot) => bot.id !== id);
        // Dispara evento de atualização
        window.dispatchEvent(new Event('botsUpdated'));
        return { bots: newBots };
    }),
    setBots: (bots) => set(() => {
        // Dispara evento de atualização
        window.dispatchEvent(new Event('botsUpdated'));
        return { bots };
    }),
}), {
    name: 'bot-storage',
    // Opções de persistência
    storage: {
        getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str)
                return null;
            try {
                const data = JSON.parse(str);
                // Converte strings de data para objetos Date
                if (data.state && Array.isArray(data.state.bots)) {
                    data.state.bots = data.state.bots.map((bot) => ({
                        ...bot,
                        createdAt: bot.createdAt ? new Date(bot.createdAt) : null,
                        updatedAt: bot.updatedAt ? new Date(bot.updatedAt) : null,
                        statistics: {
                            ...bot.statistics,
                            lastTradeAt: bot.statistics?.lastTradeAt
                                ? new Date(bot.statistics.lastTradeAt)
                                : null
                        }
                    }));
                }
                return data;
            }
            catch (err) {
                console.error('Erro ao carregar dados do localStorage:', err);
                return null;
            }
        },
        setItem: (name, value) => {
            try {
                localStorage.setItem(name, JSON.stringify(value));
            }
            catch (err) {
                console.error('Erro ao salvar dados no localStorage:', err);
            }
        },
        removeItem: (name) => localStorage.removeItem(name)
    }
}));

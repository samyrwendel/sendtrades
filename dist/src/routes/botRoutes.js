import { Router } from 'express';
import { ServerStorage } from '../api/serverStorage';
// Função para gerar ID único para o bot
function generateBotId() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}
// Função para criar um bot padrão
function createDefaultBot(userId) {
    return {
        id: generateBotId(),
        name: '',
        enabled: false,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tradingPair: 'BTCUSDT',
        exchange: {
            name: 'BINANCE',
            config: {}
        },
        webhook: {
            enabled: false,
            url: ''
        },
        settings: {},
        statistics: {
            totalTrades: 0,
            successfulTrades: 0,
            failedTrades: 0,
            lastTradeAt: null,
            profitLoss: '0',
            winRate: '0'
        }
    };
}
export function setupBotRoutes() {
    const router = Router();
    // Endpoint para listar todos os bots
    const listBots = async (_req, res) => {
        try {
            const storage = ServerStorage.getInstance();
            const bots = await storage.getBots();
            res.json({ success: true, bots });
        }
        catch (error) {
            console.error('❌ Erro ao listar bots:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao listar bots'
            });
        }
    };
    // Endpoint para obter bot específico
    const getBot = async (req, res) => {
        try {
            const storage = ServerStorage.getInstance();
            const bot = await storage.getBot(req.params.id);
            if (!bot) {
                res.status(404).json({
                    success: false,
                    message: 'Bot não encontrado'
                });
                return;
            }
            res.json({ success: true, bot });
        }
        catch (error) {
            console.error('❌ Erro ao buscar bot:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar bot'
            });
        }
    };
    // Endpoint para criar novo bot
    const createBot = async (req, res) => {
        try {
            const storage = ServerStorage.getInstance();
            const userId = req.body.userId || '';
            const newBot = {
                ...createDefaultBot(userId),
                ...req.body,
                id: generateBotId() // Sempre gerar um novo ID
            };
            console.log('📝 Criando novo bot:', newBot);
            await storage.addBot(newBot);
            res.json({ success: true, bot: newBot });
        }
        catch (error) {
            console.error('❌ Erro ao criar bot:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao criar bot'
            });
        }
    };
    // Endpoint para atualizar bot
    const updateBot = async (req, res) => {
        try {
            const storage = ServerStorage.getInstance();
            const existingBot = await storage.getBot(req.params.id);
            if (!existingBot) {
                res.status(404).json({
                    success: false,
                    message: 'Bot não encontrado'
                });
                return;
            }
            const updatedBot = {
                ...existingBot,
                ...req.body,
                id: req.params.id, // Manter o ID original
                updatedAt: new Date().toISOString()
            };
            console.log('📝 Atualizando bot:', updatedBot);
            await storage.updateBot(req.params.id, updatedBot);
            res.json({ success: true, bot: updatedBot });
        }
        catch (error) {
            console.error('❌ Erro ao atualizar bot:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar bot'
            });
        }
    };
    // Endpoint para alternar status do bot
    const toggleBot = async (req, res) => {
        try {
            const storage = ServerStorage.getInstance();
            const bot = await storage.getBot(req.params.id);
            if (!bot) {
                res.status(404).json({
                    success: false,
                    message: 'Bot não encontrado'
                });
                return;
            }
            const updatedBot = {
                ...bot,
                enabled: !bot.enabled,
                updatedAt: new Date().toISOString()
            };
            console.log('🔄 Alternando status do bot:', {
                id: bot.id,
                oldStatus: bot.enabled,
                newStatus: updatedBot.enabled
            });
            await storage.updateBot(bot.id, updatedBot);
            res.json({ success: true, bot: updatedBot });
        }
        catch (error) {
            console.error('❌ Erro ao alternar status do bot:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao alternar status do bot'
            });
        }
    };
    // Endpoint para deletar bot
    const deleteBot = async (req, res) => {
        try {
            const storage = ServerStorage.getInstance();
            const bot = await storage.getBot(req.params.id);
            if (!bot) {
                res.status(404).json({
                    success: false,
                    message: 'Bot não encontrado'
                });
                return;
            }
            console.log('🗑️ Deletando bot:', bot.id);
            await storage.deleteBot(bot.id);
            res.json({
                success: true,
                message: 'Bot deletado com sucesso'
            });
        }
        catch (error) {
            console.error('❌ Erro ao deletar bot:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao deletar bot'
            });
        }
    };
    router.get('/', listBots);
    router.get('/:id', getBot);
    router.post('/', createBot);
    router.put('/:id', updateBot);
    router.post('/:id/toggle', toggleBot);
    router.delete('/:id', deleteBot);
    return router;
}

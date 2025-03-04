import { Router } from 'express';
import { supabaseAdmin } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { ExchangeService } from '../../lib/exchangeService';
const router = Router();
// Middleware para converter Request em AuthenticatedRequest
const authMiddleware = (req, _res, next) => {
    req.user = req.user;
    next();
};
// Listar bots do usuário
const listBots = async (req, res, next) => {
    try {
        const { user } = req;
        console.log('📋 Listando bots para o usuário:', {
            userId: user?.id,
            userEmail: user?.email,
            userPlan: user?.plan
        });
        if (!user?.id) {
            console.error('❌ ID do usuário não encontrado');
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        const { data: bots, error } = await supabaseAdmin
            .from('Bots')
            .select('*')
            .eq('userId', user.id)
            .order('createdAt', { ascending: false });
        console.log('📊 Resultado da busca:', {
            botsEncontrados: bots?.length || 0,
            erro: error ? error.message : null,
            detalhes: bots?.map(bot => ({
                id: bot.id,
                name: bot.name,
                enabled: bot.enabled,
                tradingPair: bot.tradingPair
            }))
        });
        if (error) {
            console.error('❌ Erro ao listar bots:', error);
            throw error;
        }
        // Garantir que todos os bots tenham o campo enabled definido
        const processedBots = bots?.map(bot => {
            const isEnabled = bot.enabled === true;
            console.log(`Processando bot ${bot.name}: enabled = ${isEnabled} (original: ${bot.enabled}, tipo: ${typeof bot.enabled})`);
            return {
                ...bot,
                enabled: isEnabled
            };
        }) || [];
        console.log('🤖 Bots processados:', {
            total: processedBots.length,
            ativos: processedBots.filter(b => b.enabled === true).length,
            pausados: processedBots.filter(b => b.enabled === false).length,
            detalhes: processedBots.map(b => ({
                id: b.id,
                name: b.name,
                enabled: b.enabled,
                enabledType: typeof b.enabled
            }))
        });
        res.json(processedBots);
    }
    catch (error) {
        console.error('❌ Erro na rota de listagem:', error);
        next(error);
    }
};
// Obter bot por ID
const getBot = async (req, res, next) => {
    try {
        const { user } = req;
        const { data: bot, error } = await supabaseAdmin
            .from('Bots')
            .select('*')
            .eq('id', req.params.id)
            .eq('userId', user?.id)
            .single();
        if (error) {
            res.status(404).json({ error: 'Bot não encontrado' });
            return;
        }
        // Log dos dados brutos do bot
        console.log('🔍 Dados brutos do bot:', {
            exchange: bot.exchange,
            tradingInfo: bot.exchange?.config?.tradingInfo,
            tradingPair: bot.tradingPair,
            rawData: bot
        });
        // Processar os dados do bot antes de enviar
        const processedBot = {
            ...bot,
            tradingPair: bot.tradingPair,
            baseAsset: bot.exchange?.config?.tradingInfo?.baseAsset,
            quoteAsset: bot.exchange?.config?.tradingInfo?.quoteAsset,
            selectedPair: bot.tradingPair,
            exchange: {
                ...bot.exchange,
                tradingInfo: bot.exchange?.config?.tradingInfo
            }
        };
        // Log dos dados processados
        console.log('📤 Dados processados do bot:', {
            id: processedBot.id,
            name: processedBot.name,
            tradingPair: processedBot.tradingPair,
            selectedPair: processedBot.selectedPair
        });
        res.json(processedBot);
    }
    catch (error) {
        console.error('❌ Erro ao obter bot:', error);
        next(error);
    }
};
// Criar novo bot
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, tradingPair, exchange, webhook, settings, statistics, public_id } = req.body;
        const authenticatedReq = req;
        // Preparar dados do bot
        const botData = {
            id: uuidv4(),
            name,
            tradingPair: exchange.config.tradingInfo.baseAsset + exchange.config.tradingInfo.quoteAsset,
            userId: authenticatedReq.user?.id,
            exchange,
            webhook,
            settings,
            statistics,
            public_id,
            enabled: false, // Bot começa desativado por segurança
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        // Criar o bot
        const { data: bot, error } = await supabaseAdmin
            .from('Bots')
            .insert([botData])
            .select()
            .single();
        if (error) {
            console.error('❌ Erro ao criar bot:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao criar bot',
                error: error.message
            });
            return;
        }
        // Registra o log de criação
        await supabaseAdmin
            .from('BotLog')
            .insert([{
                id: uuidv4(),
                botId: bot.id,
                type: 'create',
                message: 'Bot criado com sucesso',
                data: {
                    name: bot.name,
                    tradingPair: bot.tradingPair,
                    exchange: bot.exchange.name,
                    baseAsset: bot.exchange.config.tradingInfo.baseAsset,
                    quoteAsset: bot.exchange.config.tradingInfo.quoteAsset
                },
                createdAt: new Date().toISOString()
            }]);
        res.status(201).json({
            success: true,
            message: 'Bot criado com sucesso',
            data: bot
        });
        return;
    }
    catch (error) {
        console.error('❌ Erro ao criar bot:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar bot',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        return;
    }
});
// Atualizar bot
const updateBot = async (req, res, next) => {
    try {
        const { user } = req;
        const { name, tradingPair, exchange, webhook, settings, enabled } = req.body;
        // Buscar bot existente
        const { data: existingBot, error: searchError } = await supabaseAdmin
            .from('Bots')
            .select('*')
            .eq('id', req.params.id)
            .eq('userId', user?.id)
            .single();
        if (!existingBot) {
            res.status(404).json({
                success: false,
                message: 'Bot não encontrado'
            });
            return;
        }
        // Preparar dados para atualização
        const updates = {
            name: name || existingBot.name,
            tradingPair: tradingPair || existingBot.tradingPair,
            exchange: exchange || existingBot.exchange,
            webhook: webhook || existingBot.webhook,
            settings: settings || existingBot.settings,
            enabled: enabled !== undefined ? enabled : existingBot.enabled,
            public_id: existingBot.public_id, // Preserva o public_id original
            updatedAt: new Date()
        };
        // Atualizar bot
        const { data: bot, error } = await supabaseAdmin
            .from('Bots')
            .update(updates)
            .eq('id', req.params.id)
            .eq('userId', user?.id)
            .select()
            .single();
        if (error) {
            console.error('❌ Erro ao atualizar bot:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar bot',
                error: error.message
            });
            return;
        }
        // Registrar log de atualização
        await supabaseAdmin.from('BotLog').insert([{
                id: uuidv4(),
                botId: bot.id,
                type: 'update',
                message: 'Bot atualizado',
                data: {
                    ...updates,
                    public_id: existingBot.public_id // Garante que o public_id seja registrado no log
                },
                createdAt: new Date()
            }]);
        res.json({
            success: true,
            message: 'Bot atualizado com sucesso',
            data: {
                ...bot,
                public_id: existingBot.public_id // Garante que o public_id seja retornado na resposta
            }
        });
    }
    catch (error) {
        console.error('❌ Erro ao atualizar bot:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar bot',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
};
// Excluir bot
const deleteBot = async (req, res, next) => {
    try {
        const { user } = req;
        const { error } = await supabaseAdmin
            .from('Bots')
            .delete()
            .eq('id', req.params.id)
            .eq('userId', user?.id);
        if (error)
            throw error;
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
// Função para gerar public_id único
async function generateUniquePublicId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let publicId;
    let isUnique = false;
    while (!isUnique) {
        publicId = '';
        for (let i = 0; i < 8; i++) {
            publicId += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        // Verifica se o public_id já existe
        const { data: existingBot } = await supabaseAdmin
            .from('Bots')
            .select('public_id')
            .eq('public_id', publicId)
            .single();
        if (!existingBot) {
            isUnique = true;
            return publicId;
        }
    }
    throw new Error('Não foi possível gerar um public_id único');
}
// Função para validar credenciais da exchange
async function validateExchangeCredentials(exchange, credentials) {
    try {
        const exchangeService = new ExchangeService(exchange);
        const result = await exchangeService.validateCredentials(credentials);
        return result.isValid;
    }
    catch (error) {
        console.error('❌ Erro ao validar credenciais:', error);
        return false;
    }
}
// Atualiza a função de validação de credenciais
router.post('/validate-credentials', async (req, res, next) => {
    try {
        const { exchange, credentials } = req.body;
        // Valida as credenciais com a exchange
        const isValid = await validateExchangeCredentials(exchange, credentials);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }
        // Gera um public_id único
        const public_id = await generateUniquePublicId();
        // Retorna o public_id junto com a validação
        return res.json({
            success: true,
            message: 'Credenciais válidas',
            public_id
        });
    }
    catch (error) {
        next(error);
    }
});
// Alternar estado do bot (ativar/desativar)
router.post('/:id/toggle', authMiddleware, async (req, res) => {
    try {
        const { user } = req;
        // Buscar bot atual
        const { data: bot, error: fetchError } = await supabaseAdmin
            .from('Bots')
            .select('*')
            .eq('id', req.params.id)
            .eq('userId', user?.id)
            .single();
        if (fetchError || !bot) {
            res.status(404).json({
                success: false,
                message: 'Bot não encontrado'
            });
            return;
        }
        const currentEnabled = bot.enabled === true;
        console.log('🔄 Toggle do bot:', {
            id: bot.id,
            name: bot.name,
            currentEnabled,
            newEnabled: !currentEnabled
        });
        // Atualizar estado do bot
        const { data: updatedBot, error: updateError } = await supabaseAdmin
            .from('Bots')
            .update({
            enabled: !currentEnabled,
            updatedAt: new Date().toISOString()
        })
            .eq('id', req.params.id)
            .eq('userId', user?.id)
            .select()
            .single();
        if (updateError) {
            throw updateError;
        }
        // Garantir que o bot retornado tenha o campo enabled como booleano
        const processedBot = {
            ...updatedBot,
            enabled: updatedBot.enabled === true
        };
        console.log('✅ Bot atualizado:', {
            id: processedBot.id,
            name: processedBot.name,
            enabled: processedBot.enabled,
            enabledType: typeof processedBot.enabled
        });
        // Registrar log da alteração
        await supabaseAdmin
            .from('BotLog')
            .insert([{
                id: uuidv4(),
                botId: bot.id,
                type: 'toggle',
                message: `Bot ${processedBot.enabled ? 'ativado' : 'desativado'}`,
                data: {
                    previousState: currentEnabled,
                    newState: processedBot.enabled
                },
                createdAt: new Date().toISOString()
            }]);
        res.json({
            success: true,
            message: `Bot ${processedBot.enabled ? 'ativado' : 'desativado'} com sucesso`,
            bot: processedBot
        });
    }
    catch (error) {
        console.error('❌ Erro ao alternar estado do bot:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao alternar estado do bot',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
router.get('/', authMiddleware, listBots);
router.get('/:id', authMiddleware, getBot);
router.put('/:id', authMiddleware, updateBot);
router.delete('/:id', authMiddleware, deleteBot);
export default router;

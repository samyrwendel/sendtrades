import { Router } from 'express';
import { supabaseAdmin } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { LogController } from '../controllers/logController';
const router = Router();
const logController = new LogController();
// Middleware para converter Request em AuthenticatedRequest
const authMiddleware = (req, _res, next) => {
    req.user = req.user;
    next();
};
// Listar logs de um bot
const listLogs = async (req, res, next) => {
    try {
        const { user } = req;
        const { botId } = req.params;
        // Verificar se o bot pertence ao usuário
        const { data: bot, error: botError } = await supabaseAdmin
            .from('bots')
            .select('id')
            .eq('id', botId)
            .eq('userId', user?.id)
            .single();
        if (botError || !bot) {
            res.status(404).json({ error: 'Bot não encontrado' });
            return;
        }
        const { data: logs, error } = await supabaseAdmin
            .from('BotLog')
            .select('*')
            .eq('botId', botId)
            .order('createdAt', { ascending: false });
        if (error)
            throw error;
        res.json(logs);
    }
    catch (error) {
        next(error);
    }
};
// Limpar logs de um bot
const clearLogs = async (req, res, next) => {
    try {
        const { user } = req;
        const { botId } = req.params;
        // Verificar se o bot pertence ao usuário
        const { data: bot, error: botError } = await supabaseAdmin
            .from('bots')
            .select('id')
            .eq('id', botId)
            .eq('userId', user?.id)
            .single();
        if (botError || !bot) {
            res.status(404).json({ error: 'Bot não encontrado' });
            return;
        }
        const { error } = await supabaseAdmin
            .from('BotLog')
            .delete()
            .eq('botId', botId);
        if (error)
            throw error;
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
// Criar log para um bot
const createLog = async (req, res, next) => {
    try {
        const { user } = req;
        const { botId } = req.params;
        const { type, message, data } = req.body;
        if (!type || !message) {
            res.status(400).json({ error: 'Dados incompletos' });
            return;
        }
        // Verificar se o bot pertence ao usuário
        const { data: bot, error: botError } = await supabaseAdmin
            .from('bots')
            .select('id')
            .eq('id', botId)
            .eq('userId', user?.id)
            .single();
        if (botError || !bot) {
            res.status(404).json({ error: 'Bot não encontrado' });
            return;
        }
        const { data: log, error } = await supabaseAdmin
            .from('BotLog')
            .insert([{
                id: uuidv4(),
                botId,
                type,
                message,
                data,
                createdAt: new Date()
            }])
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(log);
    }
    catch (error) {
        next(error);
    }
};
// Rotas protegidas por autenticação
router.get('/logs', authMiddleware, logController.getLogs);
router.post('/logs/clear', authMiddleware, logController.clearLogs);
router.get('/:botId', authMiddleware, listLogs);
router.delete('/:botId', authMiddleware, clearLogs);
router.post('/:botId', authMiddleware, createLog);
export default router;

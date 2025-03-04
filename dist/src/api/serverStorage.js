import fs from 'fs';
import path from 'path';
import { CacheService } from '../lib/cache/service';
export class ServerStorage {
    constructor() {
        this.saveTimeout = null;
        this.STORAGE_FILE = path.join(process.cwd(), 'server-storage.json');
        // Criar o arquivo se não existir
        if (!fs.existsSync(this.STORAGE_FILE)) {
            console.log('🆕 Criando arquivo de storage:', this.STORAGE_FILE);
            fs.writeFileSync(this.STORAGE_FILE, JSON.stringify({ bots: [], logs: [] }, null, 2));
        }
        this.data = this.loadData();
        // Garantir que os logs estejam ordenados por timestamp
        this.data.logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        // Inicializar cache
        this.cacheService = CacheService.getInstance({
            defaultTTL: 300, // 5 minutos
            provider: process.env.REDIS_HOST ? 'redis' : 'memory',
            redis: process.env.REDIS_HOST ? {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD
            } : undefined
        });
    }
    loadData() {
        try {
            console.log('📂 Carregando dados do arquivo:', this.STORAGE_FILE);
            const data = fs.readFileSync(this.STORAGE_FILE, 'utf8');
            const parsedData = JSON.parse(data);
            return {
                bots: parsedData.bots || [],
                logs: parsedData.logs || []
            };
        }
        catch (error) {
            console.error('❌ Erro ao carregar dados do servidor:', error);
            return { bots: [], logs: [] };
        }
    }
    saveData() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
            try {
                fs.writeFileSync(this.STORAGE_FILE, JSON.stringify(this.data, null, 2));
                console.log('✅ Dados salvos com sucesso');
            }
            catch (error) {
                console.error('❌ Erro ao salvar dados do servidor:', error);
            }
        }, 1000);
    }
    static getInstance() {
        if (!ServerStorage.instance) {
            ServerStorage.instance = new ServerStorage();
        }
        return ServerStorage.instance;
    }
    async getBots() {
        try {
            // Tentar obter do cache
            const cachedBots = await this.cacheService.get('bots:list');
            if (cachedBots) {
                console.log('📦 Retornando bots do cache');
                return cachedBots;
            }
            // Se não estiver no cache, retornar do storage e salvar no cache
            console.log('💾 Retornando bots do storage');
            await this.cacheService.set('bots:list', this.data.bots, { ttl: 300 });
            return this.data.bots;
        }
        catch (error) {
            console.error('❌ Erro ao obter bots:', error);
            return this.data.bots;
        }
    }
    async getBot(id) {
        try {
            // Tentar obter do cache
            const cacheKey = `bot:${id}`;
            const cachedBot = await this.cacheService.get(cacheKey);
            if (cachedBot) {
                console.log('📦 Retornando bot do cache:', id);
                return cachedBot;
            }
            // Se não estiver no cache, buscar do storage e salvar no cache
            console.log('💾 Buscando bot do storage:', id);
            const bot = this.data.bots.find(bot => bot.id === id);
            if (bot) {
                await this.cacheService.set(cacheKey, bot, { ttl: 300 });
            }
            return bot;
        }
        catch (error) {
            console.error('❌ Erro ao obter bot:', error);
            return this.data.bots.find(bot => bot.id === id);
        }
    }
    async addBot(bot) {
        const index = this.data.bots.findIndex(b => b.id === bot.id);
        if (index !== -1) {
            this.data.bots[index] = bot;
        }
        else {
            this.data.bots.push(bot);
        }
        this.saveData();
        // Invalidar cache
        await this.invalidateBotCache(bot.id);
    }
    async updateBot(id, updatedBot) {
        const index = this.data.bots.findIndex(bot => bot.id === id);
        if (index !== -1) {
            this.data.bots[index] = updatedBot;
        }
        else {
            this.data.bots.push(updatedBot);
        }
        this.saveData();
        // Invalidar cache
        await this.invalidateBotCache(id);
    }
    async deleteBot(id) {
        this.data.bots = this.data.bots.filter(bot => bot.id !== id);
        this.saveData();
        // Invalidar cache
        await this.invalidateBotCache(id);
    }
    async invalidateBotCache(botId) {
        try {
            // Invalidar cache do bot específico
            await this.cacheService.delete(`bot:${botId}`);
            // Invalidar cache da lista de bots
            await this.cacheService.delete('bots:list');
            console.log('🗑️ Cache de bots invalidado');
        }
        catch (error) {
            console.error('❌ Erro ao invalidar cache:', error);
        }
    }
    getLogs() {
        return this.data.logs;
    }
    addLog(log) {
        this.data.logs.unshift(log);
        // Manter apenas os últimos 1000 logs, ordenados por timestamp
        this.data.logs = this.data.logs
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 1000);
        this.saveData();
    }
    clearLogs() {
        this.data.logs = [];
        this.saveData();
    }
}

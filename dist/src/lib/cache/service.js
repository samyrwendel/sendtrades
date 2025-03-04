import { MemoryCacheProvider } from './providers/memory';
import { RedisCacheProvider } from './providers/redis';
export class CacheService {
    constructor(config) {
        // Se não houver Redis disponível, forçar uso do provedor de memória
        if (config.provider === 'redis' && (!config.redis || !process.env.REDIS_HOST)) {
            console.log('⚠️ Redis não disponível, usando provedor de memória');
            config.provider = 'memory';
        }
        this.config = config;
        this.provider = this.initializeProvider();
    }
    static getInstance(config) {
        if (!CacheService.instance) {
            if (!config) {
                config = {
                    defaultTTL: 3600,
                    provider: 'memory'
                };
            }
            CacheService.instance = new CacheService(config);
        }
        return CacheService.instance;
    }
    initializeProvider() {
        switch (this.config.provider) {
            case 'memory':
                return new MemoryCacheProvider(this.config.defaultTTL);
            case 'redis':
                if (!this.config.redis) {
                    throw new Error('Configuração Redis não fornecida');
                }
                return new RedisCacheProvider(this.config.redis, this.config.defaultTTL);
            default:
                throw new Error(`Provedor de cache '${this.config.provider}' não suportado`);
        }
    }
    async get(key) {
        return this.provider.get(key);
    }
    async set(key, value, options) {
        return this.provider.set(key, value, options);
    }
    async delete(key) {
        return this.provider.delete(key);
    }
    async clear(namespace) {
        return this.provider.clear(namespace);
    }
    async has(key) {
        return this.provider.has(key);
    }
    // Método utilitário para criar chaves com namespace
    static createKey(namespace, key) {
        return `${namespace}:${key}`;
    }
    // Método para trocar o provedor em tempo de execução
    static setConfig(config) {
        if (CacheService.instance) {
            CacheService.instance = new CacheService(config);
        }
    }
}

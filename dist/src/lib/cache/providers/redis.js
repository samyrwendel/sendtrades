import Redis from 'ioredis';
export class RedisCacheProvider {
    constructor(config, defaultTTL = 3600) {
        this.client = new Redis({
            host: config.host,
            port: config.port,
            password: config.password,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });
        this.defaultTTL = defaultTTL;
        // Tratamento de erros
        this.client.on('error', (error) => {
            console.error('Erro na conexão Redis:', error);
        });
    }
    getKey(key, namespace) {
        return namespace ? `${namespace}:${key}` : key;
    }
    async get(key) {
        try {
            const value = await this.client.get(key);
            if (!value)
                return null;
            return JSON.parse(value);
        }
        catch (error) {
            console.error('Erro ao recuperar valor do Redis:', error);
            return null;
        }
    }
    async set(key, value, options = {}) {
        try {
            const finalKey = this.getKey(key, options.namespace);
            const serializedValue = JSON.stringify(value);
            if (options.ttl === 0) {
                // Sem expiração
                await this.client.set(finalKey, serializedValue);
            }
            else {
                const ttl = options.ttl || this.defaultTTL;
                await this.client.set(finalKey, serializedValue, 'EX', ttl);
            }
        }
        catch (error) {
            console.error('Erro ao definir valor no Redis:', error);
            throw error;
        }
    }
    async delete(key) {
        try {
            await this.client.del(key);
        }
        catch (error) {
            console.error('Erro ao deletar chave do Redis:', error);
            throw error;
        }
    }
    async clear(namespace) {
        try {
            if (namespace) {
                const keys = await this.client.keys(`${namespace}:*`);
                if (keys.length > 0) {
                    await this.client.del(...keys);
                }
            }
            else {
                await this.client.flushdb();
            }
        }
        catch (error) {
            console.error('Erro ao limpar cache do Redis:', error);
            throw error;
        }
    }
    async has(key) {
        try {
            const exists = await this.client.exists(key);
            return exists === 1;
        }
        catch (error) {
            console.error('Erro ao verificar existência no Redis:', error);
            return false;
        }
    }
    // Método para fechar a conexão (importante para testes e limpeza)
    async disconnect() {
        await this.client.quit();
    }
    // Método público para testes
    async setRaw(key, value) {
        await this.client.set(key, value);
    }
}

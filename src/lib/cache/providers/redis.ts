import Redis from 'ioredis';
import { CacheProvider, CacheOptions } from '../types';

export class RedisCacheProvider implements CacheProvider {
  private client: Redis;
  private defaultTTL: number;

  constructor(config: { host: string; port: number; password?: string }, defaultTTL: number = 3600) {
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

  private getKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Erro ao recuperar valor do Redis:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const finalKey = this.getKey(key, options.namespace);
      const serializedValue = JSON.stringify(value);
      
      if (options.ttl === 0) {
        // Sem expiração
        await this.client.set(finalKey, serializedValue);
      } else {
        const ttl = options.ttl || this.defaultTTL;
        await this.client.set(finalKey, serializedValue, 'EX', ttl);
      }
    } catch (error) {
      console.error('Erro ao definir valor no Redis:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Erro ao deletar chave do Redis:', error);
      throw error;
    }
  }

  async clear(namespace?: string): Promise<void> {
    try {
      if (namespace) {
        const keys = await this.client.keys(`${namespace}:*`);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } else {
        await this.client.flushdb();
      }
    } catch (error) {
      console.error('Erro ao limpar cache do Redis:', error);
      throw error;
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Erro ao verificar existência no Redis:', error);
      return false;
    }
  }

  // Método para fechar a conexão (importante para testes e limpeza)
  async disconnect(): Promise<void> {
    await this.client.quit();
  }

  // Método público para testes
  public async setRaw(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }
} 
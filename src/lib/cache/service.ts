import { CacheProvider, CacheOptions, CacheConfig } from './types';
import { MemoryCacheProvider } from './providers/memory';
import { RedisCacheProvider } from './providers/redis';

export class CacheService {
  private static instance: CacheService;
  private provider: CacheProvider;
  private config: CacheConfig;

  private constructor(config: CacheConfig) {
    // Se não houver Redis disponível, forçar uso do provedor de memória
    if (config.provider === 'redis' && (!config.redis || !process.env.REDIS_HOST)) {
      console.log('⚠️ Redis não disponível, usando provedor de memória');
      config.provider = 'memory';
    }
    this.config = config;
    this.provider = this.initializeProvider();
  }

  public static getInstance(config?: CacheConfig): CacheService {
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

  private initializeProvider(): CacheProvider {
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

  public async get<T>(key: string): Promise<T | null> {
    return this.provider.get<T>(key);
  }

  public async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    return this.provider.set(key, value, options);
  }

  public async delete(key: string): Promise<void> {
    return this.provider.delete(key);
  }

  public async clear(namespace?: string): Promise<void> {
    return this.provider.clear(namespace);
  }

  public async has(key: string): Promise<boolean> {
    return this.provider.has(key);
  }

  // Método utilitário para criar chaves com namespace
  public static createKey(namespace: string, key: string): string {
    return `${namespace}:${key}`;
  }

  // Método para trocar o provedor em tempo de execução
  public static setConfig(config: CacheConfig): void {
    if (CacheService.instance) {
      CacheService.instance = new CacheService(config);
    }
  }
} 
export interface CacheOptions {
  ttl?: number; // Time to live em segundos
  namespace?: string;
}

export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  clear(namespace?: string): Promise<void>;
  has(key: string): Promise<boolean>;
}

export interface CacheConfig {
  defaultTTL: number;
  provider: 'memory' | 'redis';
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
} 
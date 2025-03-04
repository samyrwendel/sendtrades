import { CacheProvider, CacheOptions } from '../types';

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
  namespace?: string;
}

export class MemoryCacheProvider implements CacheProvider {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 3600) { // 1 hora por padrão
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.startCleanupInterval();
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Limpa entradas expiradas a cada minuto
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  private getExpirationTime(ttl?: number): number | null {
    if (ttl === 0) return null; // 0 significa sem expiração
    const seconds = ttl || this.defaultTTL;
    return Date.now() + (seconds * 1000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const expiresAt = this.getExpirationTime(options.ttl);
    
    this.cache.set(key, {
      value,
      expiresAt,
      namespace: options.namespace
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(namespace?: string): Promise<void> {
    if (!namespace) {
      this.cache.clear();
      return;
    }

    for (const [key, entry] of this.cache.entries()) {
      if (entry.namespace === namespace) {
        this.cache.delete(key);
      }
    }
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
} 
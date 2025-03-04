import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { CacheConfig } from '../cache/types';
import { RedisCacheProvider } from '../cache/providers/redis';

// Pular testes se não houver Redis disponível
const runRedisTests = process.env.REDIS_HOST ? describe : describe.skip;

runRedisTests('Redis Cache Provider', () => {
  let provider: RedisCacheProvider;

  beforeEach(async () => {
    const config: CacheConfig = {
      defaultTTL: 3600,
      provider: 'redis',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      }
    };

    provider = new RedisCacheProvider(config.redis!, config.defaultTTL);

    // Limpar cache antes de cada teste
    await provider.clear();
  });

  afterEach(async () => {
    await provider.clear();
    await provider.disconnect();
  });

  describe('Operações Básicas com Redis', () => {
    it('deve armazenar e recuperar um valor', async () => {
      const key = 'redis-test-key';
      const value = { name: 'Test Value' };

      await provider.set(key, value);
      const retrieved = await provider.get<typeof value>(key);

      expect(retrieved).toEqual(value);
    });

    it('deve retornar null para chave inexistente', async () => {
      const value = await provider.get('non-existent');
      expect(value).toBeNull();
    });

    it('deve verificar existência de chave', async () => {
      const key = 'redis-test-key';
      
      expect(await provider.has(key)).toBe(false);
      
      await provider.set(key, 'value');
      
      expect(await provider.has(key)).toBe(true);
    });

    it('deve deletar um valor', async () => {
      const key = 'redis-test-key';
      await provider.set(key, 'value');
      await provider.delete(key);

      expect(await provider.get(key)).toBeNull();
    });
  });

  describe('TTL e Expiração no Redis', () => {
    it('deve expirar valor após TTL', async () => {
      const key = 'redis-expiring-key';
      await provider.set(key, 'value', { ttl: 1 }); // 1 segundo

      // Verificar imediatamente
      expect(await provider.get(key)).toBeDefined();

      // Aguardar expiração
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(await provider.get(key)).toBeNull();
    });

    it('deve manter valor sem TTL', async () => {
      const key = 'redis-permanent-key';
      await provider.set(key, 'value', { ttl: 0 });

      // Verificar após um curto período
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(await provider.get(key)).toBeDefined();
    });
  });

  describe('Namespaces no Redis', () => {
    it('deve limpar apenas cache do namespace específico', async () => {
      await provider.set('key1', 'value1', { namespace: 'ns1' });
      await provider.set('key2', 'value2', { namespace: 'ns2' });

      await provider.clear('ns1');

      const value1 = await provider.get('ns1:key1');
      const value2 = await provider.get('ns2:key2');

      expect(value1).toBeNull();
      expect(value2).toBeDefined();
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve lidar com erros de serialização', async () => {
      const key = 'error-key';
      const circularRef: any = {};
      circularRef.self = circularRef;

      await expect(provider.set(key, circularRef))
        .rejects
        .toThrow();
    });

    it('deve retornar null para valores corrompidos', async () => {
      const key = 'corrupted-key';
      await provider.setRaw(key, 'invalid-json');

      const value = await provider.get(key);
      expect(value).toBeNull();
    });
  });
}); 
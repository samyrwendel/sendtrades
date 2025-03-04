import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { CacheService } from '../cache/service';
describe('Sistema de Cache', () => {
    let cacheService;
    beforeEach(() => {
        jest.useFakeTimers();
        const config = {
            defaultTTL: 3600,
            provider: 'memory'
        };
        cacheService = CacheService.getInstance(config);
        // Limpar cache antes de cada teste
        cacheService.clear();
    });
    afterEach(() => {
        jest.useRealTimers();
    });
    describe('Operações Básicas', () => {
        it('deve armazenar e recuperar um valor', async () => {
            const key = 'test-key';
            const value = { name: 'Test Value' };
            await cacheService.set(key, value);
            const retrieved = await cacheService.get(key);
            expect(retrieved).toEqual(value);
        });
        it('deve retornar null para chave inexistente', async () => {
            const value = await cacheService.get('non-existent');
            expect(value).toBeNull();
        });
        it('deve verificar existência de chave', async () => {
            const key = 'test-key';
            expect(await cacheService.has(key)).toBe(false);
            await cacheService.set(key, 'value');
            expect(await cacheService.has(key)).toBe(true);
        });
        it('deve deletar um valor', async () => {
            const key = 'test-key';
            await cacheService.set(key, 'value');
            await cacheService.delete(key);
            expect(await cacheService.get(key)).toBeNull();
        });
    });
    describe('TTL e Expiração', () => {
        it('deve expirar valor após TTL', async () => {
            const key = 'expiring-key';
            await cacheService.set(key, 'value', { ttl: 60 }); // 60 segundos
            // Avançar 59 segundos
            jest.advanceTimersByTime(59000);
            expect(await cacheService.get(key)).toBeDefined();
            // Avançar mais 2 segundos (total 61 segundos)
            jest.advanceTimersByTime(2000);
            expect(await cacheService.get(key)).toBeNull();
        });
        it('deve manter valor sem TTL indefinidamente', async () => {
            const key = 'permanent-key';
            await cacheService.set(key, 'value', { ttl: 0 });
            // Avançar 1 dia
            jest.advanceTimersByTime(24 * 60 * 60 * 1000);
            expect(await cacheService.get(key)).toBeDefined();
        });
    });
    describe('Namespaces', () => {
        it('deve limpar apenas cache do namespace específico', async () => {
            await cacheService.set('key1', 'value1', { namespace: 'ns1' });
            await cacheService.set('key2', 'value2', { namespace: 'ns2' });
            await cacheService.clear('ns1');
            expect(await cacheService.get('key1')).toBeNull();
            expect(await cacheService.get('key2')).toBeDefined();
        });
        it('deve criar chaves com namespace corretamente', () => {
            const key = CacheService.createKey('users', '123');
            expect(key).toBe('users:123');
        });
    });
    describe('Singleton', () => {
        it('deve manter mesma instância', () => {
            const instance1 = CacheService.getInstance();
            const instance2 = CacheService.getInstance();
            expect(instance1).toBe(instance2);
        });
        it('deve usar configuração padrão quando não fornecida', () => {
            const instance = CacheService.getInstance();
            expect(instance).toBeDefined();
        });
    });
});

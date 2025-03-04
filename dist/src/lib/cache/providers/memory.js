export class MemoryCacheProvider {
    constructor(defaultTTL = 3600) {
        this.cache = new Map();
        this.defaultTTL = defaultTTL;
        this.startCleanupInterval();
    }
    startCleanupInterval() {
        setInterval(() => {
            this.cleanup();
        }, 60000); // Limpa entradas expiradas a cada minuto
    }
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiresAt && entry.expiresAt <= now) {
                this.cache.delete(key);
            }
        }
    }
    getExpirationTime(ttl) {
        if (ttl === 0)
            return null; // 0 significa sem expiração
        const seconds = ttl || this.defaultTTL;
        return Date.now() + (seconds * 1000);
    }
    async get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (entry.expiresAt && entry.expiresAt <= Date.now()) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key, value, options = {}) {
        const expiresAt = this.getExpirationTime(options.ttl);
        this.cache.set(key, {
            value,
            expiresAt,
            namespace: options.namespace
        });
    }
    async delete(key) {
        this.cache.delete(key);
    }
    async clear(namespace) {
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
    async has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (entry.expiresAt && entry.expiresAt <= Date.now()) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
}

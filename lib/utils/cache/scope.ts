import { AsyncLocalStorage } from 'node:async_hooks';

// Keys the framework itself stores in the shared cache backend. Route code must never be able to name them.
const reservedPrefixes = ['rsshub:koa-redis-cache:', 'rsshub:path-requested:', 'rsshub:cacheTtl:', 'rsshub:http-cache:'];

const namespaceStorage = new AsyncLocalStorage<string>();

/**
 * Runs a route handler with its namespace attached, so content cache keys used during the call are
 * confined to that namespace. Keys are often built from scraped links or request parameters, and one
 * route must not be able to read or overwrite the entries of another.
 */
export const runInCacheNamespace = <T>(namespace: string, fn: () => T): T => namespaceStorage.run(namespace, fn);

export const scopeCacheKey = (key: string): string => {
    if (typeof key !== 'string') {
        throw new TypeError('Cache key must be a string');
    }
    const namespace = namespaceStorage.getStore();
    const prefix = namespace ? `${namespace}:` : '';
    const scoped = !prefix || key.startsWith(prefix) ? key : prefix + key;
    if (reservedPrefixes.some((reserved) => scoped.startsWith(reserved))) {
        throw new Error('This cache key prefix is reserved for the internal usage, please change your cache key');
    }
    return scoped;
};

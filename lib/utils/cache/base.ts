import type Redis from 'ioredis';
import type { LRUCache } from 'lru-cache';

type CacheModule = {
    init: () => void;
    get: (key: string, refresh?: boolean) => Promise<string | null> | string | null;
    has: (key: string) => Promise<boolean> | boolean;
    set: <T>(key: string, value?: string | T, maxAge?: number) => any;
    status: {
        available: boolean;
    };
    clients: {
        redisClient?: Redis;
        memoryCache?: LRUCache<string, string>;
    };
};

export const stringify = <T>(value?: string | T): string => {
    if (!value || value === 'undefined') {
        return '';
    }
    return Object(value) === value ? JSON.stringify(value) : String(value);
};

export default CacheModule;

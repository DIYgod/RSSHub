import type Redis from 'ioredis';
import type { LRUCache } from 'lru-cache';

type CacheModule = {
    get: (key: string, refresh?: boolean) => Promise<string | null> | string | null;
    set: (key: string, value?: string | Record<string, any>, maxAge?: number) => any;
    status: {
        available: boolean;
    };
    clients: {
      redisClient?: Redis;
      memoryCache?: LRUCache<{}, {}>;
    }
};

export default CacheModule;

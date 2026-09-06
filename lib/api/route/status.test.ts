import { afterEach, describe, expect, it, vi } from 'vitest';
import xxhash from 'xxhash-wasm';

const { h64ToString } = await xxhash();

const requestPath = '/github/comments/DIYgod/RSSHub/20768';
const cacheKey = 'rsshub:koa-redis-cache:' + h64ToString(requestPath + ':rss');

afterEach(() => {
    delete process.env.CACHE_TYPE;
    vi.resetModules();
});

describe('GET /api/route/status', () => {
    it('returns 404 when cache is cold', async () => {
        process.env.CACHE_TYPE = 'memory';
        const { default: api } = await import('@/api');

        const response = await api.request(`/route/status?requestPath=${requestPath}`);
        expect(response.status).toBe(404);

        const data = await response.json();
        expect(data.cached).toBe(false);
        expect(data.lastBuildDate).toBeNull();
    }, 10000);

    it('returns cached: true with lastBuildDate when cache is warm', async () => {
        process.env.CACHE_TYPE = 'memory';
        const mockBuildDate = 'Mon, 1 Jan 2026 10:00:00 GMT';
        const { default: cache } = await import('@/utils/cache/index');
        await cache.globalCache.set(
            cacheKey,
            JSON.stringify({
                lastBuildDate: mockBuildDate,
                items: [],
            })
        );
        const { default: api } = await import('@/api');

        const response = await api.request(`/route/status?requestPath=${requestPath}`);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.cached).toBe(true);
        expect(data.lastBuildDate).toBe(mockBuildDate);
    }, 10000);

    it('returns 503 when cache is unavailable', async () => {
        process.env.CACHE_TYPE = 'unsupported';
        const { default: api } = await import('@/api');

        const response = await api.request(`/route/status?requestPath=${requestPath}`);
        expect(response.status).toBe(503);

        const data = await response.json();
        expect(data.cached).toBe(false);
    }, 10000);
});

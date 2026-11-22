import type { Context } from 'hono';
import { describe, expect, it } from 'vitest';

import { getRouteCacheKey, routeCacheKey } from './route-key';

const keyOf = (headers: Record<string, string> = {}) => {
    const request = new Request('http://localhost/twitter/user/rsshub', { headers });
    return getRouteCacheKey({ req: { url: request.url, path: '/twitter/user/rsshub', query: () => {}, header: (name: string) => request.headers.get(name) ?? undefined } } as unknown as Context);
};

describe('route cache key', () => {
    it('is the same for requests without request-scoped config', () => {
        expect(keyOf()).toBe(routeCacheKey({ path: '/twitter/user/rsshub', format: 'rss', filtered: false, origin: 'http://localhost', prefix: '', query: '' }));
    });

    it('keeps requests with different request-scoped config apart', () => {
        const mine = keyOf({ 'X-RSSHub-Config': '{"twitter":{"authToken":"mine"}}' });
        const theirs = keyOf({ 'X-RSSHub-Config': '{"twitter":{"authToken":"theirs"}}' });
        expect(new Set([keyOf(), mine, theirs]).size).toBe(3);
        expect(keyOf({ 'X-RSSHub-Config': '{"twitter":{"authToken":"mine"}}' })).toBe(mine);
    });
});

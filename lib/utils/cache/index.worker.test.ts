/// <reference types="@cloudflare/vitest-pool-workers" />
import { env } from 'cloudflare:test';
import { describe, expect, it, vi } from 'vitest';

import cache, { setKVNamespace } from '@/utils/cache/index.worker';
import kv from '@/utils/cache/kv';

describe('worker cache before KV binding', () => {
    it('is unavailable and always calls the value function', async () => {
        expect(cache.status.available).toBe(false);

        const getValue = vi.fn().mockResolvedValue({ fresh: 1 });
        const first = await cache.tryGet('worker:fallback', getValue);
        const second = await cache.tryGet('worker:fallback', getValue);

        expect(first).toEqual({ fresh: 1 });
        expect(second).toEqual({ fresh: 1 });
        expect(getValue).toHaveBeenCalledTimes(2);
        expect(await cache.globalCache.get('worker:fallback')).toBeNull();
    });
});

// The binding is module-global state, so these run after the unavailable tests above
describe('worker cache with KV binding', () => {
    it('becomes available once the KV namespace is bound', () => {
        setKVNamespace(env.CACHE);
        expect(cache.status.available).toBe(true);
    });

    it('round-trips strings and serializes objects', async () => {
        await kv.set('worker:string', 'value');
        expect(await kv.get('worker:string')).toBe('value');

        await kv.set('worker:object', { a: 1 });
        expect(await kv.get('worker:object')).toBe('{"a":1}');
        expect(await kv.has('worker:object')).toBe(true);
        expect(await kv.has('worker:missing')).toBe(false);
    });

    it('tryGet caches the computed value and parses JSON on the next hit', async () => {
        const getValue = vi.fn().mockResolvedValue({ cached: true });

        const miss = await cache.tryGet('worker:tryget', getValue);
        expect(miss).toEqual({ cached: true });

        // tryGet writes the cache without awaiting the KV put
        await vi.waitFor(async () => {
            expect(await kv.has('worker:tryget')).toBe(true);
        });

        const hit = await cache.tryGet('worker:tryget', getValue);
        expect(hit).toEqual({ cached: true });
        expect(getValue).toHaveBeenCalledTimes(1);
    });

    it('stores a ttl sidecar key for non-default expiry', async () => {
        await kv.set('worker:custom-ttl', 'v', 120);
        expect(await env.CACHE.get('rsshub:cacheTtl:worker:custom-ttl')).toBe('120');

        await kv.set('worker:default-ttl', 'v');
        expect(await env.CACHE.get('rsshub:cacheTtl:worker:default-ttl')).toBeNull();
    });

    it('rejects keys using the reserved ttl prefix', async () => {
        await expect(kv.get('rsshub:cacheTtl:foo')).rejects.toThrow('reserved');
    });

    it('claims a key only once', async () => {
        expect(await cache.globalCache.claim('worker:claim', 60)).toBe(true);
        expect(await cache.globalCache.claim('worker:claim', 60)).toBe(false);
    });

    it('exposes get/set through globalCache', async () => {
        await cache.globalCache.set('worker:global', { b: 2 }, 60);
        expect(await cache.globalCache.get('worker:global')).toBe('{"b":2}');
    });
});

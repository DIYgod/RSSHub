import '../../setup';

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { assertSpecExtra } from '@/types/spec-extra.zod';
import jsonView from '@/views/json';

const fixture = JSON.parse(readFileSync(path.join(import.meta.dirname, '../../fixtures/spec-bsky.json'), 'utf-8')) as { _extras: unknown[] };

const HANDLE = 'bsky.app';

async function callHandler(handle: string) {
    const { route } = await import('@/routes/spec/bsky');
    const ctx = {
        req: { param: (k: string) => ({ handle })[k] },
    } as any;
    return route.handler(ctx);
}

describe('spec/bsky route', () => {
    it('matches snapshot — _extra shape matches the recorded fixture', async () => {
        const data = await callHandler(HANDLE);
        expect(data.item!.length).toBe(fixture._extras.length);
        expect(data.item!.map((i) => i._extra)).toEqual(fixture._extras);
    });

    it('happy path — returns posts with _extra', async () => {
        const data = await callHandler(HANDLE);
        expect(data.item!.length).toBeGreaterThan(0);
        const item = data.item![0];
        expect(item._extra?.platform).toBe('bluesky');
        expect(item._extra?.type).toBe('bsky/post');
        expect(item._extra?.handle).toBe(HANDLE);
        expect(item._extra?.rkey).toBe('3kxyzabc');
    });

    it('JSON feed view preserves _extra on each item', async () => {
        const data = await callHandler(HANDLE);
        const feed = JSON.parse(jsonView(data));
        expect(feed.items.length).toBeGreaterThan(0);
        expect(feed.items[0]._extra.platform).toBe('bluesky');
    });

    it('_extra payload validates against the Zod contract', async () => {
        const data = await callHandler(HANDLE);
        for (const item of data.item!) {
            expect(() => assertSpecExtra(item._extra)).not.toThrow();
        }
    });

    it('empty feed — returns empty item array', async () => {
        const { http, HttpResponse } = await import('msw');
        const { server } = await import('../../mocks/server');
        server.use(http.get('https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed', () => HttpResponse.json({ feed: [] })));
        const data = await callHandler(HANDLE);
        expect(data.item).toEqual([]);
    });
});

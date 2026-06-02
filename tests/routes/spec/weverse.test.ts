import '../../setup';

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { assertSpecExtra } from '@/types/spec-extra.zod';
import jsonView from '@/views/json';

const fixture = JSON.parse(readFileSync(path.join(import.meta.dirname, '../../fixtures/spec-weverse.json'), 'utf-8')) as { _extras: unknown[] };

const ARTIST_ID = '46';

afterEach(() => {
    delete process.env.WEVERSE_TOKEN;
});

async function callHandler(artistId: string, token = 'valid-token') {
    process.env.WEVERSE_TOKEN = token;
    const { route } = await import('@/routes/spec/weverse');
    const ctx = {
        req: { param: (k: string) => ({ artistId })[k] },
    } as any;
    return route.handler(ctx);
}

describe('spec/weverse route', () => {
    it('matches snapshot — _extra shape matches the recorded fixture', async () => {
        const data = await callHandler(ARTIST_ID);
        expect(data.item!.length).toBe(fixture._extras.length);
        expect(data.item!.map((i) => i._extra)).toEqual(fixture._extras);
    });

    it('happy path — returns posts with _extra', async () => {
        const data = await callHandler(ARTIST_ID);
        expect(data.item!.length).toBeGreaterThan(0);
        const item = data.item![0];
        expect(item._extra?.platform).toBe('weverse');
        expect(item._extra?.type).toBe('weverse/post');
        expect(item._extra?.artistId).toBe(ARTIST_ID);
        expect(item._extra?.communityId).toBe(ARTIST_ID);
    });

    it('exposes isPaid=true on the _extra payload for paid posts', async () => {
        const data = await callHandler(ARTIST_ID);
        const paid = data.item!.find((i) => i._extra?.isPaid === true);
        const free = data.item!.find((i) => i._extra?.isPaid === false);
        expect(paid).toBeDefined();
        expect(free).toBeDefined();
        expect(paid!._extra?.isPaid).toBe(true);
        expect(free!._extra?.isPaid).toBe(false);
    });

    it('prefixes body-less paid posts with [Paid] in the title', async () => {
        const { http, HttpResponse } = await import('msw');
        const { server } = await import('../../mocks/server');
        server.use(
            http.get('https://weverse.io/api/v2/post/v1.0/community-:communityId/feedList', () =>
                HttpResponse.json({
                    data: [
                        {
                            postId: 'post003',
                            postType: 'ARTIST',
                            communityId: 46,
                            publishedAt: '2026-04-08T12:00:00Z',
                            // body intentionally omitted
                            extension: { isPaid: true },
                            community: { name: 'Test Artist Community' },
                        },
                    ],
                })
            )
        );
        const data = await callHandler(ARTIST_ID);
        expect(data.item!.length).toBe(1);
        expect(data.item![0]._extra?.isPaid).toBe(true);
        expect(data.item![0].title).toContain('[Paid]');
    });

    it('JSON feed view preserves _extra on each item', async () => {
        const data = await callHandler(ARTIST_ID);
        const feed = JSON.parse(jsonView(data));
        expect(feed.items.length).toBeGreaterThan(0);
        expect(feed.items[0]._extra.platform).toBe('weverse');
    });

    it('_extra payload validates against the Zod contract', async () => {
        const data = await callHandler(ARTIST_ID);
        for (const item of data.item!) {
            expect(() => assertSpecExtra(item._extra)).not.toThrow();
        }
    });

    it('auth missing — throws ERR_WEVERSE_TOKEN_MISSING', async () => {
        delete process.env.WEVERSE_TOKEN;
        const { route } = await import('@/routes/spec/weverse');
        const ctx = {
            req: { param: (k: string) => ({ artistId: ARTIST_ID })[k] },
        } as any;
        await expect(route.handler(ctx)).rejects.toMatchObject({ code: 'ERR_WEVERSE_TOKEN_MISSING' });
    });

    it('auth expired — throws ERR_WEVERSE_TOKEN_EXPIRED on 401', async () => {
        const { http, HttpResponse } = await import('msw');
        const { server } = await import('../../mocks/server');
        server.use(http.get('https://weverse.io/api/v2/post/v1.0/community-:communityId/feedList', () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })));
        await expect(callHandler(ARTIST_ID, 'EXPIRED')).rejects.toMatchObject({ code: 'ERR_WEVERSE_TOKEN_EXPIRED' });
    });

    it('empty post list — returns empty item array', async () => {
        const { http, HttpResponse } = await import('msw');
        const { server } = await import('../../mocks/server');
        server.use(http.get('https://weverse.io/api/v2/post/v1.0/community-:communityId/feedList', () => HttpResponse.json({ data: [] })));
        const data = await callHandler(ARTIST_ID);
        expect(data.item).toEqual([]);
    });
});

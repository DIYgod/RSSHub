import '../../setup';

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { assertSpecExtra } from '@/types/spec-extra.zod';
import jsonView from '@/views/json';

const fixture = JSON.parse(readFileSync(path.join(import.meta.dirname, '../../fixtures/spec-bubble.json'), 'utf-8')) as { _extras: unknown[] };

const ARTIST_ID = '12345';

afterEach(() => {
    delete process.env.BUBBLE_COOKIE;
});

async function callHandler(artistId: string, cookie = 'valid-cookie') {
    process.env.BUBBLE_COOKIE = cookie;
    const { route } = await import('@/routes/spec/bubble');
    const ctx = {
        req: { param: (k: string) => ({ artistId })[k] },
    } as any;
    return route.handler(ctx);
}

describe('spec/bubble route', () => {
    it('matches snapshot — _extra shape matches the recorded fixture', async () => {
        const data = await callHandler(ARTIST_ID);
        expect(data.item!.length).toBe(fixture._extras.length);
        expect(data.item!.map((i) => i._extra)).toEqual(fixture._extras);
    });

    it('happy path — returns messages with _extra', async () => {
        const data = await callHandler(ARTIST_ID);
        expect(data.item!.length).toBeGreaterThan(0);
        const item = data.item![0];
        expect(item._extra?.platform).toBe('bubble');
        expect(item._extra?.type).toBe('bubble/message');
        expect(item._extra?.artistId).toBe(ARTIST_ID);
        expect(item._extra?.bubbleRoomId).toBe(ARTIST_ID);
    });

    it('maps messageType TEXT -> text and IMAGE -> image', async () => {
        const data = await callHandler(ARTIST_ID);
        const text = data.item!.find((i) => i._extra?.externalId === 'msg001');
        const image = data.item!.find((i) => i._extra?.externalId === 'msg002');
        expect(text!._extra?.messageType).toBe('text');
        expect(image!._extra?.messageType).toBe('image');
    });

    it('JSON feed view preserves _extra on each item', async () => {
        const data = await callHandler(ARTIST_ID);
        const feed = JSON.parse(jsonView(data));
        expect(feed.items.length).toBeGreaterThan(0);
        expect(feed.items[0]._extra.platform).toBe('bubble');
    });

    it('_extra payload validates against the Zod contract', async () => {
        const data = await callHandler(ARTIST_ID);
        for (const item of data.item!) {
            expect(() => assertSpecExtra(item._extra)).not.toThrow();
        }
    });

    it('auth missing — throws ERR_BUBBLE_COOKIE_MISSING', async () => {
        delete process.env.BUBBLE_COOKIE;
        const { route } = await import('@/routes/spec/bubble');
        const ctx = {
            req: { param: (k: string) => ({ artistId: ARTIST_ID })[k] },
        } as any;
        await expect(route.handler(ctx)).rejects.toMatchObject({ code: 'ERR_BUBBLE_COOKIE_MISSING' });
    });

    it('auth expired — throws ERR_BUBBLE_COOKIE_EXPIRED on 401', async () => {
        const { http, HttpResponse } = await import('msw');
        const { server } = await import('../../mocks/server');
        server.use(http.get('https://api.bubblem.io/v1/rooms/:artistId/messages', () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })));
        await expect(callHandler(ARTIST_ID, 'EXPIRED')).rejects.toMatchObject({ code: 'ERR_BUBBLE_COOKIE_EXPIRED' });
    });

    it('empty message list — returns empty item array', async () => {
        const { http, HttpResponse } = await import('msw');
        const { server } = await import('../../mocks/server');
        server.use(http.get('https://api.bubblem.io/v1/rooms/:artistId/messages', () => HttpResponse.json({ messages: [] })));
        const data = await callHandler(ARTIST_ID);
        expect(data.item).toEqual([]);
    });
});

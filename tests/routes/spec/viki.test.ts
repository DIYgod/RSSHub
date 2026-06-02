import '../../setup';

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { assertSpecExtra } from '@/types/spec-extra.zod';
import jsonView from '@/views/json';

const fixture = JSON.parse(readFileSync(path.join(import.meta.dirname, '../../fixtures/spec-viki.json'), 'utf-8')) as { _extras: unknown[] };

const TITLE_ID = 't-title1';

async function callHandler(titleId: string) {
    const { route } = await import('@/routes/spec/viki');
    const ctx = {
        req: { param: (k: string) => ({ titleId })[k] },
    } as any;
    return route.handler(ctx);
}

describe('spec/viki route', () => {
    it('matches snapshot — _extra shape matches the recorded fixture', async () => {
        const data = await callHandler(TITLE_ID);
        expect(data.item!.length).toBe(fixture._extras.length);
        expect(data.item!.map((i) => i._extra)).toEqual(fixture._extras);
    });

    it('happy path — returns items with _extra', async () => {
        const data = await callHandler(TITLE_ID);
        expect(data.item!.length).toBeGreaterThan(0);
        const item = data.item![0];
        expect(item._extra?.platform).toBe('viki');
        expect(item._extra?.type).toBe('viki/episode');
        expect(item._extra?.titleId).toBe(TITLE_ID);
        expect(item._extra?.episodeNumber).toBe(1);
    });

    it('maps regionLocked flag from API', async () => {
        const data = await callHandler(TITLE_ID);
        const locked = data.item!.find((i) => i._extra?.externalId === 'ep002');
        expect(locked).toBeDefined();
        expect(locked!._extra?.regionLocked).toBe(true);
    });

    it('JSON feed view preserves _extra on each item', async () => {
        const data = await callHandler(TITLE_ID);
        const feed = JSON.parse(jsonView(data));
        expect(feed.items.length).toBeGreaterThan(0);
        expect(feed.items[0]._extra.platform).toBe('viki');
    });

    it('_extra payload validates against the Zod contract', async () => {
        const data = await callHandler(TITLE_ID);
        for (const item of data.item!) {
            expect(() => assertSpecExtra(item._extra)).not.toThrow();
        }
    });

    it('auth expired — throws ERR_VIKI_AUTH on 401', async () => {
        const { http, HttpResponse } = await import('msw');
        const { server } = await import('../../mocks/server');
        server.use(http.get('https://api.viki.io/v4/containers/:titleId', () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })));
        await expect(callHandler(TITLE_ID)).rejects.toMatchObject({ code: 'ERR_VIKI_AUTH' });
    });

    it('empty episode list — returns empty item array', async () => {
        const { http, HttpResponse } = await import('msw');
        const { server } = await import('../../mocks/server');
        server.use(http.get('https://api.viki.io/v4/containers/:titleId/episodes', () => HttpResponse.json({ response: [] })));
        const data = await callHandler(TITLE_ID);
        expect(data.item).toEqual([]);
    });
});

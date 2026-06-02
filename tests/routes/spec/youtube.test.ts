import '../../setup';

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { assertSpecExtra } from '@/types/spec-extra.zod';
import jsonView from '@/views/json';

const fixture = JSON.parse(readFileSync(path.join(import.meta.dirname, '../../fixtures/spec-youtube.json'), 'utf-8')) as { _extras: unknown[] };

// 24-char base64-like channel id matching the regex /^UC[\w-]{21}[AQgw]$/
const CHANNEL_ID = 'UCaaaaaaaaaaaaaaaaaaaaaA';

async function callHandler(channelId: string) {
    const { route } = await import('@/routes/spec/youtube');
    const ctx = {
        req: { param: (k: string) => ({ channelId })[k] },
    } as any;
    return route.handler(ctx);
}

describe('spec/youtube route', () => {
    it('matches snapshot — _extra shape matches the recorded fixture', async () => {
        const data = await callHandler(CHANNEL_ID);
        expect(data.item).toBeDefined();
        expect(data.item!.length).toBe(fixture._extras.length);

        const actualExtras = data.item!.map((i) => i._extra);
        expect(actualExtras).toEqual(fixture._extras);
    });

    it('happy path — returns items with _extra', async () => {
        const data = await callHandler(CHANNEL_ID);
        expect(data.item).toBeDefined();
        expect(data.item!.length).toBeGreaterThan(0);

        const item = data.item![0];
        expect(item._extra?.platform).toBe('youtube');
        expect(item._extra?.type).toBe('youtube/video');
        expect(item._extra?.channelId).toBe(CHANNEL_ID);
        expect(item._extra?.isMembershipOnly).toBe(false);
        expect(item.title).toBe('Test Video One');
        expect(item.link).toBe('https://www.youtube.com/watch?v=vid001');
        expect(item.guid).toBe(`spec-youtube-${CHANNEL_ID}-vid001`);
    });

    it('JSON feed view preserves _extra on each item', async () => {
        const data = await callHandler(CHANNEL_ID);
        const feed = JSON.parse(jsonView(data));
        expect(feed.items.length).toBeGreaterThan(0);
        expect(feed.items[0]._extra.platform).toBe('youtube');
        expect(feed.items[0]._extra.externalId).toBe('vid001');
    });

    it('_extra payload validates against the Zod contract', async () => {
        const data = await callHandler(CHANNEL_ID);
        for (const item of data.item!) {
            expect(() => assertSpecExtra(item._extra)).not.toThrow();
        }
    });

    it('empty channel — returns empty item array', async () => {
        const { http, HttpResponse } = await import('msw');
        const { server } = await import('../../mocks/server');
        server.use(
            http.get('https://www.youtube.com/feeds/videos.xml', () =>
                HttpResponse.xml(
                    `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://www.youtube.com/xml/schemas/2015">
  <title>Empty</title>
  <yt:channelId>${CHANNEL_ID}</yt:channelId>
</feed>`
                )
            )
        );
        const data = await callHandler(CHANNEL_ID);
        expect(data.item).toEqual([]);
    });

    it('rejects invalid channel id format with InvalidParameterError', async () => {
        const { route } = await import('@/routes/spec/youtube');
        const ctx = {
            req: { param: () => 'not-a-real-channel-id' },
        } as any;
        await expect(route.handler(ctx)).rejects.toThrow(/Invalid YouTube channel ID/);
    });
});

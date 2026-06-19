import '../../setup';

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { assertSpecExtra } from '@/types/spec-extra.zod';
import jsonView from '@/views/json';

const fixture = JSON.parse(readFileSync(path.join(import.meta.dirname, '../../fixtures/spec-youtube.json'), 'utf-8')) as { _extras: unknown[] };

// 24-char base64-like channel id matching the regex /^UC[\w-]{21}[AQgw]$/
const CHANNEL_ID = 'UCaaaaaaaaaaaaaaaaaaaaaA';

/** Posts use relative `publishedAt` in mocks — strip before snapshot compare. */
function stripVolatilePostDates(extra: Record<string, unknown>) {
    if (extra.contentKind !== 'post') {
        return extra;
    }
    return Object.fromEntries(Object.entries(extra).filter(([key]) => key !== 'publishedAt'));
}

async function callHandler(channelId: string, types?: string) {
    const { route } = await import('@/routes/spec/youtube');
    const ctx = {
        req: {
            param: (k: string) => ({ channelId })[k],
            query: (k: string) => (k === 'types' ? types : undefined),
        },
    } as any;
    return route.handler(ctx);
}

describe('spec/youtube route', () => {
    it('matches snapshot — _extra shape matches the recorded fixture', async () => {
        const data = await callHandler(CHANNEL_ID);
        expect(data.item).toBeDefined();
        expect(data.item!.length).toBe(fixture._extras.length);

        const actualExtras = data.item!.map((i) => stripVolatilePostDates(i._extra as Record<string, unknown>));
        const expectedExtras = fixture._extras.map((e) => stripVolatilePostDates(e as Record<string, unknown>));
        expect(actualExtras).toEqual(expectedExtras);
    });

    it('happy path — returns items with _extra', async () => {
        const data = await callHandler(CHANNEL_ID);
        expect(data.item).toBeDefined();
        expect(data.item!.length).toBeGreaterThan(0);

        const item = data.item!.find((i) => i._extra?.externalId === 'vid001');
        expect(item).toBeDefined();
        expect(item!._extra?.platform).toBe('youtube');
        expect(item!._extra?.type).toBe('youtube/video');
        expect(item!._extra?.channelId).toBe(CHANNEL_ID);
        expect(item!._extra?.isMembershipOnly).toBe(false);
        expect(item!.title).toBe('Test Video One');
        expect(item!.link).toBe('https://www.youtube.com/watch?v=vid001');
        expect(item!.guid).toBe(`spec-youtube-${CHANNEL_ID}-video-vid001`);
    });

    it('JSON feed view preserves _extra on each item', async () => {
        const data = await callHandler(CHANNEL_ID);
        const feed = JSON.parse(jsonView(data));
        expect(feed.items.length).toBeGreaterThan(0);
        expect(feed.items[0]._extra.platform).toBe('youtube');
        const videoItem = feed.items.find((i: { _extra?: { externalId?: string } }) => i._extra?.externalId === 'vid001');
        expect(videoItem?._extra?.externalId).toBe('vid001');
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
        const emptyFeed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://www.youtube.com/xml/schemas/2015">
  <title>Empty</title>
  <yt:channelId>${CHANNEL_ID}</yt:channelId>
</feed>`;
        server.use(
            http.get('https://www.youtube.com/feeds/videos.xml', () => HttpResponse.xml(emptyFeed)),
            http.get(`https://www.youtube.com/channel/${CHANNEL_ID}/posts`, () => HttpResponse.text('<html></html>'))
        );
        const data = await callHandler(CHANNEL_ID);
        expect(data.item).toEqual([]);
    });

    it('types=video returns only long-form uploads', async () => {
        const { route } = await import('@/routes/spec/youtube');
        const ctx = {
            req: {
                param: (k: string) => ({ channelId: CHANNEL_ID })[k],
                query: (k: string) => (k === 'types' ? 'video' : undefined),
            },
        } as any;
        const data = await route.handler(ctx);
        expect(data.item!.map((i) => i._extra?.type)).toEqual(['youtube/video', 'youtube/video']);
    });

    it('includes shorts, live replays, and community posts by default', async () => {
        const data = await callHandler(CHANNEL_ID);
        const kinds = data.item!.map((i) => (i._extra as { contentKind?: string })?.contentKind);
        expect(kinds).toContain('short');
        expect(kinds).toContain('live');
        expect(kinds).toContain('post');
        expect(kinds).toContain('video');
    });

    it('rejects invalid channel id format with InvalidParameterError', async () => {
        const { route } = await import('@/routes/spec/youtube');
        const ctx = {
            req: {
                param: () => 'not a real channel id!',
                query: () => {},
            },
        } as any;
        await expect(route.handler(ctx)).rejects.toThrow(/Invalid YouTube channel ID/);
    });

    it('resolves @handle to UC channel id before fetching Atom feed', async () => {
        const { http, HttpResponse } = await import('msw');
        const { server } = await import('../../mocks/server');
        const resolvedId = 'UCbbbbbbbbbbbbbbbbbbbbbA';

        server.use(
            http.get('https://www.youtube.com/@TestChannel', () => HttpResponse.text(`<html><script>"channelId":"${resolvedId}"</script></html>`, { headers: { 'Content-Type': 'text/html' } })),
            http.get('https://www.youtube.com/feeds/videos.xml', ({ request }) => {
                const url = new URL(request.url);
                expect(url.searchParams.get('playlist_id')).toBe(`UULF${resolvedId.slice(2)}`);
                return HttpResponse.xml(
                    `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://www.youtube.com/xml/schemas/2015">
  <title>Handle Channel</title>
  <yt:channelId>${resolvedId}</yt:channelId>
  <entry>
    <yt:videoId>vid-handle</yt:videoId>
    <title>Handle Video</title>
    <link href="https://www.youtube.com/watch?v=vid-handle"/>
    <published>2026-01-01T00:00:00+00:00</published>
  </entry>
</feed>`
                );
            })
        );

        const data = await callHandler('@TestChannel', 'video');
        expect(data.item).toHaveLength(1);
        expect(data.item![0]._extra?.channelId).toBe(resolvedId);
        expect(data.item![0].guid).toBe(`spec-youtube-${resolvedId}-video-vid-handle`);
    });
});

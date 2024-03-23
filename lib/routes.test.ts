import { describe, expect, it } from 'vitest';
import app from '@/app';
import Parser from 'rss-parser';
const parser = new Parser();
import { config } from '@/config';

const criticalRoutes = [
    '/test/1',
    '/test/cache',
    '/bilibili/user/dynamic/2267573',
    '/bilibili/bangumi/media/9192',
    '/bilibili/ranking/0/3/1',
    '/mastodon/timeline/pawoo.net/true',
    '/mastodon/acct/CatWhitney@mastodon.social/statuses',
    '/misskey/notes/featured/misskey.io',
    '/pixiv/search/Nezuko/popular/2',
    '/pixiv/ranking/week',
    '/pixiv/user/15288095',
    '/telegram/channel/rove',
    '/threads/zuck',
    '/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ',
];

async function checkRSS(response) {
    const checkDate = (date) => {
        expect(date).toEqual(expect.any(String));
        expect(Date.parse(date)).toEqual(expect.any(Number));
        expect(Date.now() - +new Date(date)).toBeGreaterThan(-1000 * 60 * 60 * 24 * 5);
        expect(Date.now() - +new Date(date)).toBeLessThan(1000 * 60 * 60 * 24 * 30 * 12 * 10);
    };

    const parsed = await parser.parseString(await response.text());

    expect(parsed).toEqual(expect.any(Object));
    expect(parsed.title).toEqual(expect.any(String));
    expect(parsed.title).not.toBe('RSSHub');
    expect(parsed.description).toEqual(expect.any(String));
    expect(parsed.link).toEqual(expect.any(String));
    expect(parsed.lastBuildDate).toEqual(expect.any(String));
    expect(parsed.ttl).toEqual(Math.trunc(config.cache.routeExpire / 60) + '');
    expect(parsed.items).toEqual(expect.any(Array));
    checkDate(parsed.lastBuildDate);

    // check items
    const guids: (string | undefined)[] = [];
    for (const item of parsed.items) {
        expect(item).toEqual(expect.any(Object));
        expect(item.title).toEqual(expect.any(String));
        expect(item.link).toEqual(expect.any(String));
        expect(item.content).toEqual(expect.any(String));
        expect(item.guid).toEqual(expect.any(String));
        if (item.pubDate) {
            expect(item.pubDate).toEqual(expect.any(String));
            checkDate(item.pubDate);
        }

        // guid must be unique
        expect(guids).not.toContain(item.guid);
        guids.push(item.guid);
    }
}

describe('routes', () => {
    for (const route of criticalRoutes) {
        it(`critical routes: ${route}`, async () => {
            const response = await app.request(route);
            expect(response.status).toBe(200);
            await checkRSS(response);
        });
    }
});

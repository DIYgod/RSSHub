import { describe, expect, it, afterAll } from 'vitest';
process.env.SOCKET = 'socket';

import app from '@/app';
import Parser from 'rss-parser';
const parser = new Parser();
import { config } from '@/config';

afterAll(() => {
    delete process.env.SOCKET;
});

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

describe('router', () => {
    // root
    it(`/`, async () => {
        const response = await app.request('/');
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toBe('text/html; charset=UTF-8');
        expect(response.headers.get('cache-control')).toBe('no-cache');
    });

    // route
    it(`/test/1`, async () => {
        const response = await app.request('/test/1');
        expect(response.status).toBe(200);

        await checkRSS(response);
    });

    // robots.txt
    it('/robots.txt', async () => {
        config.disallowRobot = false;
        const response404 = await app.request('/robots.txt');
        expect(response404.status).toBe(404);

        config.disallowRobot = true;
        const response = await app.request('/robots.txt');
        expect(response.status).toBe(200);
        expect(await response.text()).toBe('User-agent: *\nDisallow: /');
        expect(response.headers.get('content-type')).toBe('text/plain; charset=UTF-8');
    });

    // favicon.ico
    it('/favicon.ico', async () => {
        const response = await app.request('/favicon.ico');
        expect(response.status).toBe(200);
    });
});

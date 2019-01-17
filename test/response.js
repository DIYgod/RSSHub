const supertest = require('supertest');
const app = require('../lib/index');
const request = supertest(app.callback());
const Parser = require('rss-parser');
const parser = new Parser();
const config = require('../lib/config');

async function checkRSS(response) {
    expect(response.headers['content-type']).toBe('application/xml; charset=utf-8');
    expect(response.headers['cache-control']).toBe(`max-age=${config.cacheExpire / 2}`);

    const checkDate = (date) => {
        expect(date).toEqual(expect.any(String));
        expect(Date.parse(date)).toEqual(expect.any(Number));
        expect(new Date() - new Date(date)).toBeGreaterThan(-1000 * 60 * 60 * 24 * 5);
        expect(new Date() - new Date(date)).toBeLessThan(1000 * 60 * 60 * 24 * 30 * 12 * 5);
    };

    const parsed = await parser.parseString(response.text);

    expect(parsed).toEqual(expect.any(Object));
    expect(parsed.title).toEqual(expect.any(String));
    expect(parsed.title).not.toBe('RSSHub');
    expect(parsed.description).toEqual(expect.any(String));
    expect(parsed.link).toEqual(expect.any(String));
    expect(parsed.lastBuildDate).toEqual(expect.any(String));
    expect(parsed.items).toEqual(expect.any(Array));
    checkDate(parsed.lastBuildDate);

    // check items
    const guids = [];
    parsed.items.forEach((item) => {
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
    });
}

describe('response', () => {
    it(`/`, async () => {
        const response = await request.get('/');
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('text/html; charset=UTF-8');
        expect(response.headers['cache-control']).toBe('no-cache');
    });

    it(`/test (origin)`, async () => {
        const response = await request.get('/test');
        expect(response.status).toBe(200);

        await checkRSS(response);
    });

    it(`/test (cache)`, async () => {
        const response = await request.get('/test');
        expect(response.status).toBe(200);
        if (config.cacheType === 'memory') {
            expect(response.headers['x-koa-memory-cache']).toBe('true');
        } else if (config.cacheType === 'redis') {
            expect(response.headers['x-koa-redis-cache']).toBe('true');
        }

        await checkRSS(response);
    });
});

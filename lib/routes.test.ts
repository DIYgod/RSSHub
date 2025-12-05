import Parser from 'rss-parser';
import { describe, expect, it } from 'vitest';

import app from '@/app';
import { config } from '@/config';

const parser = new Parser();

process.env.ALLOW_USER_SUPPLY_UNSAFE_DOMAIN = 'true';

const routes = {
    '/test/:id': '/test/1',
};
if (process.env.FULL_ROUTES_TEST) {
    const { namespaces } = await import('@/registry');
    for (const namespace in namespaces) {
        for (const route in namespaces[namespace].routes) {
            const requireConfig = namespaces[namespace].routes[route].features?.requireConfig;
            let configs;
            if (typeof requireConfig !== 'boolean') {
                configs = requireConfig
                    ?.filter((config) => !config.optional)
                    .map((config) => config.name)
                    .filter((name) => name !== 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN');
            }
            if (namespaces[namespace].routes[route].example && !configs?.length) {
                routes[`/${namespace}${route}`] = namespaces[namespace].routes[route].example;
            }
        }
    }
}

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
    for (const route in routes) {
        it.concurrent(
            route,
            {
                timeout: 60000,
            },
            async () => {
                const response = await app.request(routes[route]);
                expect(response.status).toBe(200);
                await checkRSS(response);
            }
        );
    }
});

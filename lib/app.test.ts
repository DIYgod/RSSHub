import Parser from 'rss-parser';
import undici from 'undici';
import { describe, expect, it, vi } from 'vitest';

import app from '@/app';
import { config } from '@/config';
import * as xueqiuCookies from '@/routes/xueqiu/cookies';
import feedCache from '@/utils/cache';
import * as ofetchModule from '@/utils/ofetch';

describe('index', () => {
    it('exports app entrypoint', () => {
        expect(app.request).toBeInstanceOf(Function);
    });

    it('serve index', async () => {
        const res = await app.request('/');
        expect(res.status).toBe(200);
        expect(await res.text()).toContain('Welcome to RSSHub!');
    });
});

describe('request-rewriter', () => {
    it('should rewrite request', async () => {
        const fetchSpy = vi.spyOn(undici, 'fetch');
        await app.request('/test/httperror');

        // headers
        const request = fetchSpy.mock.lastCall?.[0];
        if (!(request instanceof undici.Request)) {
            throw new TypeError('the rewriter did not call undici fetch with a Request');
        }
        expect(request.headers.get('user-agent')).toMatch(/Chrome/);
    });
});

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
            if (Array.isArray(requireConfig)) {
                configs = requireConfig
                    .filter((config) => !config.optional)
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
    const guids: Array<string | undefined> = [];
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

// Synthetic timeline/detail payloads; requests are mocked within each test.
const fetchMock = vi.fn();
const invoke = async () => {
    const response = await app.request('/xueqiu/user/fixture-owner');
    expect(response.status).toBe(200);
    const feed = await parser.parseString(await response.text());
    return { item: feed.items.map((item) => ({ ...item, description: item.content })) };
};
const status = (extra: any = {}) => ({ id: 1, target: '/fixture-owner/1', created_at: 1_767_225_600_000, user: { screen_name: 'Fixture' }, description: 'list summary', truncated: true, ...extra });
const timelineTest = (name: string, test: () => Promise<void>) =>
    it(name, async () => {
        fetchMock.mockReset();
        feedCache.clients.memoryCache?.clear();
        const fetchSpy = vi.spyOn(ofetchModule, 'default').mockImplementation(fetchMock);
        const cookieSpy = vi.spyOn(xueqiuCookies, 'parseToken').mockResolvedValue('');
        try {
            await test();
        } finally {
            fetchSpy.mockRestore();
            cookieSpy.mockRestore();
        }
    });

describe('Xueqiu timeline text and fallback rendering', () => {
    for (const truncated of [false, undefined]) {
        timelineTest(`reuses complete list text without requesting detail: truncated=${truncated}`, async () => {
            fetchMock.mockResolvedValueOnce({
                statuses: [status({ text: '<p>full list text</p>', legal_user_visible: false, truncated, image_info_list: [{ filename: 'fixture.png' }], retweeted_status: { user: { screen_name: 'Quoted' }, text: 'quoted text' } })],
            });
            const result = await invoke();
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(result.item[0]).toMatchObject({ title: 'full list text', link: 'https://xueqiu.com/fixture-owner/1' });
            expect(result.item[0].description).toContain('<p>full list text</p>');
            expect(result.item[0].description).toContain('https://xqimg.imedao.com/fixture.png');
            expect(result.item[0].description).toContain('Quoted:&nbsp;quoted text');
        });
    }

    timelineTest('still fetches detail when list text is explicitly truncated', async () => {
        fetchMock.mockResolvedValueOnce({ statuses: [status({ text: 'preview', truncated: true })] }).mockResolvedValueOnce({ text: '<p>complete detail</p>' });
        expect((await invoke()).item[0].description).toBe('<p>complete detail</p>');
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    timelineTest('preserves media on the existing legal-user list shortcut', async () => {
        fetchMock.mockResolvedValueOnce({ statuses: [status({ legal_user_visible: true, image_info_list: [{ filename: 'fixture.png' }], retweeted_status: { description: 'quoted description' } })] });
        const item = (await invoke()).item[0];
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(item.description).toContain('list summary');
        expect(item.description).toContain('fixture.png');
        expect(item.description).toContain('quoted description');
        expect(item.description).not.toContain('undefined');
    });

    timelineTest('does not skip detail just because legal_user_visible is true with no content', async () => {
        fetchMock.mockResolvedValueOnce({ statuses: [status({ legal_user_visible: true, text: '', description: '' })] }).mockResolvedValueOnce({ text: 'complete detail' });
        expect((await invoke()).item[0].description).toBe('complete detail');
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    for (const text of [' '.repeat(3), 123, undefined]) {
        timelineTest(`uses a valid description when list text is unusable: ${String(text)}`, async () => {
            fetchMock.mockResolvedValueOnce({ statuses: [status({ text, legal_user_visible: true, description: '<p>usable description</p>', image_info_list: {} })] });
            const item = (await invoke()).item[0];
            expect(item.title).toBe('usable description');
            expect(item.description).toBe('<p>usable description</p>');
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });
    }

    timelineTest('keeps text, pictures and repost when a detail request fails', async () => {
        fetchMock
            .mockResolvedValueOnce({ statuses: [status({ text: 'current list text', image_info_list: [{ filename: 'current.png' }], retweeted_status: { text: 'quoted text' } })] })
            .mockRejectedValueOnce(new Error('temporary failure'));
        const item = (await invoke()).item[0];
        expect(item.title).toBe('current list text');
        expect(item.description).toContain('current list text');
        expect(item.description).toContain('current.png');
        expect(item.description).toContain('quoted text');
        expect(item.description).not.toContain('undefined');
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    timelineTest('retains description-only details with empty text and missing repost author', async () => {
        fetchMock.mockResolvedValueOnce({ statuses: [status()] }).mockResolvedValueOnce({ text: '', description: '<p>detail description</p>', retweeted_status: { description: 'quoted description' } });
        const item = (await invoke()).item[0];
        expect(item.description).toContain('<p>detail description</p>');
        expect(item.description).toContain('quoted description');
        expect(item.description).not.toContain('undefined');
    });
});

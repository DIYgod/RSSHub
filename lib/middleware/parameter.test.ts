import { once } from 'node:events';
import nodeHttp from 'node:http';
import type { AddressInfo } from 'node:net';

import { Context } from 'hono';
import { http, HttpResponse } from 'msw';
import { RE2JS } from 're2js';
import Parser from 'rss-parser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import server from '@/setup.test';

process.env.OPENAI_API_KEY = 'sk-1234567890';
process.env.OPENAI_API_ENDPOINT = 'https://api.openai.mock/v1';

const { config } = await import('@/config');
const { default: app } = await import('@/app');
const { default: parameter } = await import('@/middleware/parameter');
const { default: cache } = await import('@/utils/cache');

const parser = new Parser();

const runMiddleware = async (data: any, query: Record<string, string | undefined>) => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
            searchParams.set(key, value);
        }
    }
    const ctx = new Context(new Request(`http://localhost/test?${searchParams.toString()}`));
    ctx.set('data', data);
    await parameter(ctx, async () => {});
    return ctx.get('data');
};

describe('filter', () => {
    it('filter', async () => {
        const response = await app.request('/test/1?filter=Description4|Title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Title4');
        expect(parsed.items[1].title).toBe('Title5');
    });

    it('filter filter_case_sensitive default', async () => {
        const response = await app.request('/test/1?filter=description4|title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(0);
    });

    it('filter filter_case_sensitive=false', async () => {
        const response = await app.request('/test/1?filter=description4|title5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Title4');
        expect(parsed.items[1].title).toBe('Title5');
    });

    it('filter_title', async () => {
        const response = await app.request('/test/1?filter_title=Description4|Title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].title).toBe('Title5');
    });

    it('filter_title filter_case_sensitive=false', async () => {
        const response = await app.request('/test/1?filter_title=description4|title5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].title).toBe('Title5');
    });

    it('filter_description', async () => {
        const response = await app.request('/test/1?filter_description=Description4|Title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].title).toBe('Title4');
    });

    it('filter_description filter_case_sensitive=false', async () => {
        const response = await app.request('/test/1?filter_description=description4|title5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].title).toBe('Title4');
    });

    it('filter_author', async () => {
        const response = await app.request('/test/1?filter_author=DIYgod4|DIYgod5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Title4');
        expect(parsed.items[1].title).toBe('Title5');
    });

    it('filter_author filter_case_sensitive default', async () => {
        const response = await app.request('/test/1?filter_author=diygod4|diygod5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(0);
    });

    it('filter_author filter_case_sensitive=false', async () => {
        const response = await app.request('/test/1?filter_author=diygod4|diygod5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Title4');
        expect(parsed.items[1].title).toBe('Title5');
    });

    it('filter_category', async () => {
        const response = await app.request('/test/filter?filter_category=Category0|Category1');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Filter Title1');
        expect(parsed.items[1].title).toBe('Filter Title2');
    });

    it('filter_category filter_case_sensitive default', async () => {
        const response = await app.request('/test/filter?filter_category=category0|category1');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(0);
    });

    it('filter_category filter_case_sensitive=false', async () => {
        const response = await app.request('/test/filter?filter_category=category0|category1&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Filter Title1');
        expect(parsed.items[1].title).toBe('Filter Title2');
    });

    it('filter_category filter_case_sensitive=false category string', async () => {
        const response = await app.request('/test/filter?filter_category=category3&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].title).toBe('Filter Title3');
    });

    it('filter_category illegal_category', async () => {
        const response = await app.request('/test/filter-illegal-category?filter_category=CategoryIllegal');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].categories?.length).toBe(1);
        expect(parsed.items[0].categories?.[0]).toBe('CategoryIllegal');
    });

    it('filter_time', async () => {
        const response = await app.request('/test/current_time?filter_time=25');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
    });

    it('filterout', async () => {
        const response = await app.request('/test/1?filterout=Description4|Title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(3);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });

    it('filterout filter_case_sensitive default', async () => {
        const response = await app.request('/test/1?filterout=description4|title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(5);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });

    it('filterout filter_case_sensitive=false', async () => {
        const response = await app.request('/test/1?filterout=description4|title5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(3);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });

    it('filterout_title', async () => {
        const response = await app.request('/test/1?filterout_title=Description4|Title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(4);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
        expect(parsed.items[3].title).toBe('Title4');
    });

    it('filterout_title filter_case_sensitive=false', async () => {
        const response = await app.request('/test/1?filterout_title=description4|title5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(4);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
        expect(parsed.items[3].title).toBe('Title4');
    });

    it('filterout_description', async () => {
        const response = await app.request('/test/1?filterout_description=Description4|Title5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(4);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
        expect(parsed.items[3].title).toBe('Title5');
    });

    it('filterout_description filter_case_sensitive=false', async () => {
        const response = await app.request('/test/1?filterout_description=description4|title5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(4);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
        expect(parsed.items[3].title).toBe('Title5');
    });

    it('filterout_author', async () => {
        const response = await app.request('/test/1?filterout_author=DIYgod4|DIYgod5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(3);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });

    it('filterout_author filter_case_sensitive default', async () => {
        const response = await app.request('/test/1?filterout_author=diygod4|diygod5');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(5);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });

    it('filterout_author filter_case_sensitive=false', async () => {
        const response = await app.request('/test/1?filterout_author=diygod4|diygod5&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(3);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });

    it('filterout_category', async () => {
        const response = await app.request('/test/filter?filterout_category=Category0|Category1');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(6);
        expect(parsed.items[0].title).toBe('Filter Title3');
        expect(parsed.items[1].title).toBe('Title1');
        expect(parsed.items[2].title).toBe('Title2');
    });

    it('filterout_category filter_case_sensitive default', async () => {
        const response = await app.request('/test/filter?filterout_category=category0|category1');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(8);
        expect(parsed.items[0].title).toBe('Filter Title1');
        expect(parsed.items[1].title).toBe('Filter Title2');
        expect(parsed.items[2].title).toBe('Filter Title3');
        expect(parsed.items[3].title).toBe('Title1');
    });

    it('filterout_category filter_case_sensitive=false', async () => {
        const response = await app.request('/test/filter?filterout_category=category0|category1&filter_case_sensitive=false');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(6);
        expect(parsed.items[0].title).toBe('Filter Title3');
        expect(parsed.items[1].title).toBe('Title1');
        expect(parsed.items[2].title).toBe('Title2');
    });

    it('filter combination', async () => {
        const response = await app.request('/test/filter?filter_title=Filter&filter_description=Description1');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(1);
        expect(parsed.items[0].title).toBe('Filter Title1');
    });

    it('filterout combination', async () => {
        const response = await app.request('/test/filter?filterout_title=Filter&filterout_description=Description1');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(4);
        expect(parsed.items[0].title).toBe('Title2');
    });
});

describe('limit', () => {
    it.each([undefined, '', 'invalid', '-2', 'NaN', 'Infinity'])('preserves entries for an invalid or absent limit: %s', async (limit) => {
        const items = Array.from({ length: 5 }, (_, index) => ({ title: `Entry ${index}`, link: `https://rsshub.example/${index}` }));
        const result = await runMiddleware({ title: 'Limit validation', item: items }, { limit });
        expect(result.item.map((item) => item.title)).toEqual(items.map((item) => item.title));
        expect(result.item.map((item) => item.link)).toEqual(items.map((item) => item.link));
    });

    it.each([
        { limit: '0', count: 0 },
        { limit: '1', count: 1 },
        { limit: '3', count: 3 },
        { limit: '2.5', count: 2 },
        { limit: '20', count: 5 },
    ])('retains the existing nonnegative limit $limit', async ({ limit, count }) => {
        const items = Array.from({ length: 5 }, (_, index) => ({ title: `Entry ${index}`, link: `https://rsshub.example/${index}` }));
        const result = await runMiddleware({ title: 'Limit validation', item: items }, { limit });
        expect(result.item.map((item) => item.title)).toEqual(items.slice(0, count).map((item) => item.title));
    });

    it('limit', async () => {
        const response = await app.request('/test/1?limit=3');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(3);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title2');
        expect(parsed.items[2].title).toBe('Title3');
    });
});

describe('sorted', () => {
    it.each([
        { preference: undefined, sorted: undefined, order: ['Recent', 'Ranked'] },
        { preference: false, sorted: undefined, order: ['Ranked', 'Recent'] },
        { preference: false, sorted: 'true', order: ['Recent', 'Ranked'] },
        { preference: false, sorted: 'yes', order: ['Recent', 'Ranked'] },
        { preference: true, sorted: 'false', order: ['Ranked', 'Recent'] },
    ])('respects route preference $preference with common sorted=$sorted', async ({ preference, sorted, order }) => {
        const result = await runMiddleware(
            {
                title: 'Ranking',
                sortItems: preference,
                item: [
                    { title: 'Ranked', pubDate: '2026-10-07T12:00:00Z' },
                    { title: 'Recent', pubDate: '2026-10-09T12:00:00Z' },
                ],
            },
            { sorted }
        );
        expect(result.item.map((item) => item.title)).toEqual(order);
        expect(result.item.every((item) => !Number.isNaN(Date.parse(item.pubDate)))).toBe(true);
    });

    it('filters publication times while preserving a source ranking', async () => {
        const now = Date.now();
        const result = await runMiddleware(
            {
                title: 'Ranking',
                sortItems: false,
                item: [
                    { title: 'Ranked', pubDate: new Date(now - 20000) },
                    { title: 'Expired', pubDate: new Date(now - 120000) },
                    { title: 'Recent', pubDate: new Date(now - 10000) },
                ],
            },
            { filter_time: '60' }
        );
        expect(result.item.map((item) => item.title)).toEqual(['Ranked', 'Recent']);
    });

    it('sorted', async () => {
        const response = await app.request('/test/sort?sorted=false');
        expect(response.status).toBe(200);
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].title).toBe('Sort Title 0');
        expect(parsed.items[1].title).toBe('Sort Title 1');
        expect(parsed.items[2].title).toBe('Sort Title 2');
        expect(parsed.items[3].title).toBe('Sort Title 3');
    });
});

describe('tgiv', () => {
    it('tgiv', async () => {
        const response = await app.request('/test/1?tgiv=test');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].link).toBe('https://t.me/iv?url=https%3A%2F%2Fgithub.com%2FDIYgod%2FRSSHub%2Fissues%2F1&rhash=test');
        expect(parsed.items[1].link).toBe('https://t.me/iv?url=https%3A%2F%2Fgithub.com%2FDIYgod%2FRSSHub%2Fissues%2F2&rhash=test');
    });
});

describe('empty', () => {
    it('empty', async () => {
        const response1 = await app.request('/test/empty');
        expect(response1.status).toBe(503);
        expect(await response1.text()).toMatch(/Error: this route is empty/);

        const response2 = await app.request('/test/1?limit=0');
        expect(response2.status).toBe(200);
        const parsed = await parser.parseString(await response2.text());
        expect(parsed.items.length).toBe(0);
    });
});

describe('allow_empty', () => {
    it('allow_empty', async () => {
        const response = await app.request('/test/allow_empty');
        expect(response.status).toBe(200);
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(0);
    });
});

describe('wrong_path', () => {
    it('wrong_path', async () => {
        const response = await app.request('/wrong');
        expect(response.status).toBe(404);
        expect(response.headers.get('cache-control')).toBe(`public, max-age=${config.cache.routeExpire}`);
        expect(await response.text()).toMatch('The route does not exist or has been deleted.');
    });
});

describe('fulltext_mode', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('fulltext', async () => {
        const response = await app.request('/test/1?mode=fulltext');
        expect(response.status).toBe(200);
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].content).not.toBe(undefined);
    }, 60000);

    it('skips item links on local addresses', async () => {
        const handler = vi.fn((_req: nodeHttp.IncomingMessage, res: nodeHttp.ServerResponse) => res.end('<html><body><p>Local page</p></body></html>'));
        const server = nodeHttp.createServer(handler);
        await once(server.listen(0, '127.0.0.1'), 'listening');
        const { port } = server.address() as AddressInfo;
        try {
            const result = await runMiddleware(
                {
                    title: 'Fulltext',
                    link: 'https://github.com/DIYgod/RSSHub',
                    item: [
                        { title: 'Title1', description: 'Description1', link: `http://127.0.0.1:${port}/page` },
                        { title: 'Title2', description: 'Description2', link: `http://localhost:${port}/page` },
                    ],
                },
                { mode: 'fulltext' }
            );
            expect(handler).not.toHaveBeenCalled();
            expect(result.item[0].description).toBe('Description1');
            expect(result.item[1].description).toBe('Description2');
        } finally {
            server.close();
        }
    });

    describe('with pages on test hosts', () => {
        // the msw hosts do not resolve, so let item links through to them
        beforeEach(() => {
            config.feature.allow_user_supply_unsafe_domain = true;
        });
        afterEach(() => {
            config.feature.allow_user_supply_unsafe_domain = false;
        });

        it('replaces the description with the parsed page', async () => {
            const { default: server } = await import('@/setup.test');
            server.use(http.get('http://rsshub.test/fulltext', () => HttpResponse.html(`<article>${'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>'.repeat(10)}</article>`)));

            const data = await runMiddleware({ item: [{ title: 'Title', description: 'Description', link: 'http://rsshub.test/fulltext' }] }, { mode: 'fulltext' });
            expect(data.item[0].description).toContain('Lorem ipsum');
        });

        it('keeps the description when the page is not text', async () => {
            const { default: server } = await import('@/setup.test');
            server.use(http.get('http://rsshub.test/fulltext-pdf', () => HttpResponse.text('%PDF-1.4 '.repeat(10), { headers: { 'content-type': 'application/pdf' } })));

            const data = await runMiddleware({ item: [{ title: 'Title', description: 'Description', link: 'http://rsshub.test/fulltext-pdf' }] }, { mode: 'fulltext' });
            expect(data.item[0].description).toBe('Description');
        });

        it('keeps the description when the page is too large', async () => {
            const { default: server } = await import('@/setup.test');
            server.use(http.get('http://rsshub.test/fulltext-large', () => HttpResponse.html(`<article>${'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>'.repeat(100000)}</article>`)));

            const data = await runMiddleware({ item: [{ title: 'Title', description: 'Description', link: 'http://rsshub.test/fulltext-large' }] }, { mode: 'fulltext' });
            expect(data.item[0].description).toBe('Description');
        });

        it('keeps the description and answers other requests when the page takes too long to parse', async () => {
            const { default: server } = await import('@/setup.test');
            server.use(http.get('http://rsshub.test/fulltext-slow', () => HttpResponse.html('<p>'.repeat(50000))));
            const timeout = AbortSignal.timeout.bind(AbortSignal);
            vi.spyOn(AbortSignal, 'timeout').mockImplementation((ms) => timeout(Math.min(ms, 1000)));

            let ticks = 0;
            const interval = setInterval(() => ticks++, 50);
            const data = await runMiddleware({ item: [{ title: 'Title', description: 'Description', link: 'http://rsshub.test/fulltext-slow' }] }, { mode: 'fulltext' });
            clearInterval(interval);
            expect(data.item[0].description).toBe('Description');
            expect(ticks).toBeGreaterThan(5);
        });
    });
});

describe('complicated_description', () => {
    it('complicated_description', async () => {
        const response = await app.request('/test/complicated');
        expect(response.status).toBe(200);
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].content).toBe(`<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">

<a href="http://mock.com/DIYgod/RSSHub"></a>
<img src="https://mock.com/DIYgod/RSSHub.jpg" data-src="/DIYgod/RSSHub0.jpg" referrerpolicy="no-referrer">
<img data-src="/DIYgod/RSSHub.jpg" src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<img data-mock="/DIYgod/RSSHub.png" src="https://mock.com/DIYgod/RSSHub.png" referrerpolicy="no-referrer">
<img mock="/DIYgod/RSSHub.gif" src="https://mock.com/DIYgod/RSSHub.gif" referrerpolicy="no-referrer">
<img src="http://mock.com/DIYgod/DIYgod/RSSHub" referrerpolicy="no-referrer">
<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" referrerpolicy="no-referrer">`);
        expect(parsed.items[1].content).toBe(`<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`);
    });
});

describe('multimedia_description', () => {
    it('multimedia_description', async () => {
        const response = await app.request('/test/multimedia');
        expect(response.status).toBe(200);
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].content).toBe(`<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<video src="https://mock.com/DIYgod/RSSHub.mp4"></video>
<video poster="https://mock.com/DIYgod/RSSHub.jpg">
<source src="https://mock.com/DIYgod/RSSHub.mp4" type="video/mp4">
<source src="https://mock.com/DIYgod/RSSHub.webm" type="video/webm">
</video>
<audio src="https://mock.com/DIYgod/RSSHub.mp3"></audio>
<iframe src="https://mock.com/DIYgod/RSSHub.html" referrerpolicy="no-referrer"></iframe>`);
    });
});

describe('sort', () => {
    it('sort', async () => {
        const response = await app.request('/test/sort');
        expect(response.status).toBe(200);
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].title).toBe('Sort Title 3');
        expect(parsed.items.at(-3)?.title).toBe('Sort Title 2');
        expect(parsed.items.at(-2)?.title).toBe('Sort Title 0');
        expect(parsed.items.at(-1)?.title).toBe('Sort Title 1');
    });
});

describe('mess parameter', () => {
    it('date', async () => {
        const response = await app.request('/test/mess');
        expect(response.status).toBe(200);
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].pubDate).toBe('Mon, 31 Dec 2018 16:00:00 GMT');
        expect(parsed.items[0].link).toBe('https://github.com/DIYgod/RSSHub/issues/0');
    });

    it('drops invalid pubDate', async () => {
        const result = await runMiddleware(
            {
                title: 'Test',
                link: 'https://example.com',
                item: [{ title: 'Invalid date', pubDate: 'Invalid Date' }],
            },
            {}
        );
        expect(result.item[0].pubDate).toBeUndefined();
    });
});

describe('opencc', () => {
    it('opencc', async () => {
        const response = await app.request('/test/opencc?opencc=t2s');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].title).toBe('小可爱');
        expect(parsed.items[0].content).toBe('宇宙无敌');
    });
});

describe('brief', () => {
    it('brief', async () => {
        const response = await app.request('/test/brief?brief=100');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items[0].title).toBe('小可愛');
        expect(parsed.items[0].content).toBe(
            '<p>宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵宇宙無敵…</p>'
        );
    });
});

describe('multi parameter', () => {
    it('filter before limit', async () => {
        const response = await app.request('/test/filter-limit?filterout_title=2&limit=2');
        const parsed = await parser.parseString(await response.text());
        expect(parsed.items.length).toBe(2);
        expect(parsed.items[0].title).toBe('Title1');
        expect(parsed.items[1].title).toBe('Title3');
    });
});

describe('openai', () => {
    it('processes both title and description', async () => {
        config.openai.inputOption = 'both';
        const responseWithGpt = await app.request('/test/gpt?chatgpt=true');
        const responseNormal = await app.request('/test/gpt');

        expect(responseWithGpt.status).toBe(200);
        expect(responseNormal.status).toBe(200);

        const parsedGpt = await parser.parseString(await responseWithGpt.text());
        const parsedNormal = await parser.parseString(await responseNormal.text());

        expect(parsedGpt.items[0].title).not.toBe(parsedNormal.items[0].title);
        expect(parsedGpt.items[0].title).toContain('AI processed content.');
        expect(parsedGpt.items[0].content).not.toBe(parsedNormal.items[0].content);
        expect(parsedGpt.items[0].content).toContain('AI processed content.');
    });

    it('processes title or description', async () => {
        // test title
        config.openai.inputOption = 'title';
        const responseTitleOnly = await app.request('/test/gpt?chatgpt=true');
        const parsedTitleOnly = await parser.parseString(await responseTitleOnly.text());
        expect(parsedTitleOnly.items[0].title).toContain('AI processed content.');
        expect(parsedTitleOnly.items[0].content).not.toContain('AI processed content.');

        // test description
        config.openai.inputOption = 'description';
        const responseDescriptionOnly = await app.request('/test/gpt?chatgpt=true');
        const parsedDescriptionOnly = await parser.parseString(await responseDescriptionOnly.text());
        expect(parsedDescriptionOnly.items[0].title).not.toContain('AI processed content.');
        expect(parsedDescriptionOnly.items[0].content).toContain('AI processed content.');
    });
});

describe('parameter middleware branches', () => {
    it('normalizes base urls and updates quote links', async () => {
        const data = {
            link: 'example.com/base',
            item: [
                {
                    title: 'Item 1',
                    link: '/relative',
                    description: '<div class="rsshub-quote">Quote</div><a href="/foo">Foo</a>',
                    _extra: {
                        links: [{ href: 'https://example.com' }],
                    },
                },
                {
                    title: 'Item 2',
                    description: '<img src="/img.png" />',
                },
            ],
            allowEmpty: true,
        };

        const result = await runMiddleware(data, {});
        expect(result.item[0].link).toBe('http://example.com/relative');
        expect(result.item[1].description).toContain('http://example.com/img.png');
        expect(result.item[0]._extra.links[0].content_html).toContain('rsshub-quote');
    });

    it('keeps items without link in tgiv mode', async () => {
        const data = {
            link: 'https://example.com',
            item: [{ title: 'NoLink' }],
        };

        const result = await runMiddleware(data, { tgiv: 'hash' });
        expect(result.item[0].link).toBeUndefined();
    });

    it('rewrites links for scihub', async () => {
        const data = {
            link: 'https://example.com',
            item: [
                { title: 'With DOI', doi: '10.1000/xyz' },
                { title: 'With link', link: 'https://example.com/paper' },
            ],
        };

        const result = await runMiddleware(data, { scihub: '1' });
        expect(result.item[0].link).toBe(`${config.scihub.host}10.1000/xyz`);
        expect(result.item[1].link).toBe(`${config.scihub.host}https://example.com/paper`);
    });

    it('throws on invalid brief value', async () => {
        const data = {
            link: 'https://example.com',
            item: [{ title: 'Item', description: 'Desc' }],
        };

        await expect(runMiddleware(data, { brief: '10' })).rejects.toThrow('Invalid parameter brief');
    });

    it('does not repeat a long base url in any number of relative links', async () => {
        const padding = 'a'.repeat(20000);

        // relative links of one description
        const description = await runMiddleware({ link: 'https://example.com', item: [{ title: 'hostile', link: `https://example.com/?${padding}`, description: '<a href="#"></a>'.repeat(10000) }] }, {});
        expect(description.item[0].description.startsWith(`<a href="https://example.com/?${padding}#"></a>`)).toBe(true);
        expect(description.item[0].description.endsWith('<a href="#"></a>')).toBe(true);
        expect(JSON.stringify(description).length).toBeLessThan(5 * 1024 * 1024);

        // the descriptions of one feed share the budget
        const descriptions = await runMiddleware(
            { link: 'https://example.com', item: Array.from({ length: 100 }, (_, index) => ({ title: 'hostile', link: `https://example.com/${index}?${padding}`, description: '<a href="#"></a>'.repeat(100) })) },
            {}
        );
        expect(JSON.stringify(descriptions).length).toBeLessThan(7 * 1024 * 1024);

        // the links of its items
        const links = await runMiddleware({ link: `https://example.com/?${padding}`, item: Array.from({ length: 10000 }, () => ({ title: 'hostile', link: '#' })) }, {});
        expect(links.item[0].link).toBe(`https://example.com/?${padding}#`);
        expect(links.item.at(-1).link).toBe('#');
        expect(JSON.stringify(links).length).toBeLessThan(5 * 1024 * 1024);

        // what is left relative is not resolved for the attachments either
        const attachments = await runMiddleware(
            { link: 'https://example.com', item: [{ title: 'hostile', link: `https://example.com/${padding}/`, description: Array.from({ length: 10000 }, (_, index) => `<a href="${index}.mp3"></a>`).join('') }] },
            { enclosure: 'true' }
        );
        expect(attachments.item[0].attachments[0].url).toBe(`https://example.com/${padding}/0.mp3`);
        expect(attachments.item[0].attachments.length).toBeLessThan(10000);
        expect(JSON.stringify(attachments).length).toBeLessThan(9 * 1024 * 1024);
    });

    it('processes openai description and title', async () => {
        const originalInput = config.openai.inputOption;

        const descriptionData = {
            link: 'https://example.com',
            item: [
                {
                    title: 'Title',
                    description: 'Description',
                    link: `https://example.com/${Date.now()}/desc`,
                },
            ],
        };
        config.openai.inputOption = 'description';
        const descriptionResult = await runMiddleware(descriptionData, { chatgpt: 'true' });
        expect(descriptionResult.item[0].description).toContain('AI processed content.');

        const titleData = {
            link: 'https://example.com',
            item: [
                {
                    title: 'Title',
                    description: 'Description',
                    link: `https://example.com/${Date.now()}/title`,
                },
            ],
        };
        config.openai.inputOption = 'title';
        const titleResult = await runMiddleware(titleData, { chatgpt: 'true' });
        expect(titleResult.item[0].title).toContain('AI processed content.');

        config.openai.inputOption = originalInput;
    });

    it('does not share openai results between items with the same link', async () => {
        // echo the input so the test can tell which text a completion was made from
        server.use(
            http.post('https://api.openai.mock/v1/chat/completions', async ({ request }) => {
                const body = (await request.json()) as { messages: Array<{ content: string }> };
                return HttpResponse.json({ choices: [{ message: { content: `AI: ${body.messages[1].content}` } }] });
            })
        );
        const originalInput = config.openai.inputOption;
        config.openai.inputOption = 'both';

        const link = `https://example.com/${Date.now()}/shared`;
        const first = await runMiddleware({ link: 'https://example.com', item: [{ title: 'First title', description: 'First description', link }] }, { chatgpt: 'true' });
        const second = await runMiddleware({ link: 'https://example.com', item: [{ title: 'Second title', description: 'Second description', link }] }, { chatgpt: 'true' });

        expect(first.item[0].title).toBe('AI: First title');
        expect(first.item[0].description).toContain('AI: First description');
        expect(second.item[0].title).toBe('AI: Second title');
        expect(second.item[0].description).toContain('AI: Second description');
        expect(second.item[0].description).not.toContain('First description');

        config.openai.inputOption = originalInput;
    });
});

describe.each([{ engine: 'regexp' as const }, { engine: 're2' as const }])('parameter middleware filtering with $engine engine', ({ engine }) => {
    it('filters items', async () => {
        const originalEngine = config.feature.filter_regex_engine;
        config.feature.filter_regex_engine = engine;

        const data = {
            link: 'https://example.com',
            item: [
                { title: 'Keep', description: 'A' },
                { title: 'Drop', description: 'B' },
            ],
        };

        const result = await runMiddleware(data, { filter: 'Keep' });
        expect(result.item).toHaveLength(1);
        expect(result.item[0].title).toBe('Keep');

        config.feature.filter_regex_engine = originalEngine;
    });

    it('matches categories when other fields do not match', async () => {
        const originalEngine = config.feature.filter_regex_engine;
        config.feature.filter_regex_engine = engine;

        const data = {
            link: 'https://example.com',
            item: [
                {
                    title: 'Nope',
                    description: 'Also nope',
                    author: 'Still nope',
                    category: ['Match'],
                },
            ],
        };

        const result = await runMiddleware(data, { filter: 'Match' });
        expect(result.item).toHaveLength(1);
        expect(result.item[0].category).toContain('Match');

        config.feature.filter_regex_engine = originalEngine;
    });
});

describe('filter-engine', () => {
    afterEach(() => {
        delete process.env.FILTER_REGEX_ENGINE;
        vi.resetModules();
    });

    it('filter RE2 engine ReDoS attack', async () => {
        const freshApp = (await import('@/app')).default;

        const response = await freshApp.request('/test/1?filter=abc(%3F%3Ddef)');
        expect(response.status).toBe(503);
        expect(await response.text()).toMatch(/RE2JSSyntaxException/);
    });

    it('filter Regexp engine backward compatibility', async () => {
        process.env.FILTER_REGEX_ENGINE = 'regexp';

        const freshApp = (await import('@/app')).default;

        const response = await freshApp.request('/test/1?filter=abc(%3F%3Ddef)');
        expect(response.status).toBe(200);
    });

    it('filter Regexp engine test config', async () => {
        process.env.FILTER_REGEX_ENGINE = 'somethingelse';

        const freshApp = (await import('@/app')).default;

        const response = await freshApp.request('/test/1?filter=abc(%3F%3Ddef)');
        expect(response.status).toBe(503);
        expect(await response.text()).toMatch(/somethingelse/);
    });
});

const makeData = (description = 'Desc') => ({
    link: 'https://example.com',
    item: [1, 2, 3].map((i) => ({ title: `Item ${i}`, description, author: 'Author', category: ['Category'] })),
});

describe('filter limits', () => {
    const filters = ['filter', 'filter_title', 'filter_description', 'filter_author', 'filter_category', 'filterout', 'filterout_title', 'filterout_description', 'filterout_author', 'filterout_category'];

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each(filters)('rejects too long %s', async (filter) => {
        await expect(runMiddleware(makeData(), { [filter]: 'a'.repeat(1024) })).resolves.toBeDefined();
        await expect(runMiddleware(makeData(), { [filter]: 'a'.repeat(1025) })).rejects.toThrow('longer than 1024 characters');
    });

    it.each(filters)('rejects too complex %s', async (filter) => {
        await expect(runMiddleware(makeData(), { [filter]: '.{0,100}[0-9]' })).resolves.toBeDefined();
        await expect(runMiddleware(makeData(), { [filter]: '.{0,1000}.{0,100}[0-9]' })).rejects.toThrow('too complex');
    });

    it('responds with an error', async () => {
        const response = await app.request(`/test/brief?filter=${encodeURIComponent('.{0,1000}'.repeat(20) + '[0-9]')}`);
        expect(response.status).toBe(503);
        expect(await response.text()).toMatch(/InvalidParameterError: Invalid filter: too complex/);
    });

    it('rejects filter too complex for the text', async () => {
        const short = makeData('a'.repeat(10000));
        const long = makeData('a'.repeat(100000));
        // only the step limit is under test here, not the time limit
        vi.spyOn(Date, 'now').mockReturnValue(0);
        await expect(runMiddleware(short, { filter_description: '.{0,400}[0-9]' })).resolves.toBeDefined();
        await expect(runMiddleware(long, { filter_description: '.{0,400}[0-9]' })).rejects.toThrow('too complex for this feed');
    });

    it('rejects filter taking too long', async () => {
        let now = 0;
        vi.spyOn(Date, 'now').mockImplementation(() => (now += 600));
        await expect(runMiddleware(makeData(), { filterout: 'Nothing' })).rejects.toThrow('takes too long');
    });

    it('compiles each filter once', async () => {
        const compile = vi.spyOn(RE2JS, 'compile');
        const result = await runMiddleware(makeData(), { filter_title: 'Item', filter_description: 'Desc', filterout: 'Item 2' });
        expect(result.item.map((item) => item.title)).toEqual(['Item 1', 'Item 3']);
        expect(compile).toHaveBeenCalledTimes(3);
    });
});

describe('entities', () => {
    it('decodes HTML entities', async () => {
        const data = await runMiddleware(
            {
                title: 'Feed&nbsp;Title &amp; More',
                description: 'Feed&hellip;',
                item: [{ title: 'Item&rsquo;s &#8217; &notify ?a=1&lt=2' }],
            },
            {}
        );
        expect(data.title).toBe('Feed\u{A0}Title & More');
        expect(data.description).toBe('Feed…');
        expect(data.item[0].title).toBe('Item’s ’ &notify ?a=1&lt=2');
    });
});

const makeImageData = () => ({
    image: 'https://example.com/logo.png',
    item: [
        {
            title: 'Post',
            link: 'https://example.com/post',
            description:
                '<p>Text</p><picture><source srcset="https://example.com/a.webp"><img src="https://example.com/a.png"></picture><video src="https://example.com/a.mp4" poster="https://example.com/a.jpg"></video><audio src="https://example.com/a.mp3"></audio>',
            image: 'https://example.com/a.png',
            banner: 'https://example.com/banner.png',
            itunes_item_image: 'https://example.com/art.png',
            enclosure_url: 'https://example.com/a.png',
            enclosure_type: 'image/png',
            enclosure_length: 10,
            attachments: [
                { url: 'https://example.com/a.png', mime_type: 'image/png' },
                { url: 'https://example.com/a.mp3', mime_type: 'audio/mpeg' },
            ],
            media: { thumbnail: { url: 'https://example.com/a.png' } },
        },
    ],
});

describe('show_image', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each([undefined, 'true'])('removes fulltext images with enclosure=%s', async (enclosure) => {
        const fulltext =
            '<p>Full article content replacing the original summary.</p><img src="https://example.com/full.png"><picture><source srcset="https://example.com/full.webp"><img src="https://example.com/full.png"></picture><video src="https://example.com/full.mp4" poster="https://example.com/poster.jpg"></video><audio src="https://example.com/full.mp3"></audio>';
        vi.spyOn(cache, 'tryGet').mockResolvedValue({ content: fulltext });

        const data = await runMiddleware(makeImageData(), { mode: 'fulltext', show_image: 'false', enclosure });
        const item = data.item[0];
        expect(item.description).toContain('<p>Full article content replacing the original summary.</p>');
        expect(item.description).not.toMatch(/<img|<picture|poster=/);
        expect(item.description).toContain('<video src="https://example.com/full.mp4"></video>');
        expect(item.description).toContain('<audio src="https://example.com/full.mp3"></audio>');
        expect(item.attachments.every((attachment) => !attachment.mime_type.startsWith('image/'))).toBe(true);
        if (enclosure === 'true') {
            expect(item.attachments).toEqual(
                expect.arrayContaining([
                    { url: 'https://example.com/full.mp4', mime_type: 'video/mp4' },
                    { url: 'https://example.com/full.mp3', mime_type: 'audio/mpeg' },
                ])
            );
        }
    });

    it('keeps fulltext images by default', async () => {
        const fulltext = '<p>Full article content replacing the original summary.</p><img src="https://example.com/full.png">';
        vi.spyOn(cache, 'tryGet').mockResolvedValue({ content: fulltext });

        const data = await runMiddleware(makeImageData(), { mode: 'fulltext' });
        expect(data.item[0].description).toBe(fulltext);
    });

    it('keeps the filtered summary when fulltext is too short', async () => {
        vi.spyOn(cache, 'tryGet').mockResolvedValue({ content: '<p>Short</p>' });

        const data = await runMiddleware(makeImageData(), { mode: 'fulltext', show_image: 'false' });
        expect(data.item[0].description).toContain('<p>Text</p>');
        expect(data.item[0].description).not.toMatch(/<img|<picture|poster=/);
    });

    it('removes pictures and artwork while retaining text, video and audio', async () => {
        const data = await runMiddleware(makeImageData(), { show_image: 'false' });
        expect(data.image).toBeUndefined();
        expect(data.item[0].description).not.toMatch(/<img|<picture|poster=/);
        expect(data.item[0].description).toContain('<p>Text</p>');
        expect(data.item[0].description).toContain('a.mp4');
        expect(data.item[0].image).toBeUndefined();
        expect(data.item[0].itunes_item_image).toBeUndefined();
        expect(data.item[0].enclosure_url).toBeUndefined();
        expect(data.item[0].attachments).toHaveLength(1);
        expect(data.item[0].attachments[0].mime_type).toBe('audio/mpeg');
        expect(data.item[0].media.thumbnail).toBeUndefined();
    });
    it('keeps images by default', async () => {
        const data = await runMiddleware(makeImageData(), {});
        expect(data.item[0].description).toContain('<img');
        expect(data.item[0].image).toBe('https://example.com/a.png');
    });
});

describe('image enclosure type', () => {
    it.each([
        ['https://example.com/image.jpg', 'image/jpeg'],
        ['https://example.com/image.jpeg', 'image/jpeg'],
        ['https://example.com/image.png', 'image/png'],
        ['https://example.com/image.webp', 'image/webp'],
        ['https://example.com/image.gif', 'image/gif'],
        ['https://example.com/image.svg', 'image/svg+xml'],
        ['https://example.com/image.PNG?size=300#preview', 'image/png'],
        ['//example.com/image.gif', 'image/gif'],
    ])('infers %s as %s', async (image, mimeType) => {
        const data = await runMiddleware({ item: [{ title: 'Image', image }] }, {});
        expect(data.item[0].enclosure_type).toBe(mimeType);
        expect(data.item[0].enclosure_url).toBeUndefined();
    });

    it.each(['https://example.com/image', 'https://example.com/image?filename=image.jpg', 'https://example.com/image.unknown', 'https://example.com/page.html', 'https://example.com/video.mp4', 'https://['])(
        'does not invent a MIME type for %s',
        async (image) => {
            const data = await runMiddleware({ item: [{ title: 'Image', image }] }, {});
            expect(data.item[0].enclosure_type).toBeUndefined();
        }
    );

    it('leaves explicit enclosures and attachments alone', async () => {
        const data = await runMiddleware(
            {
                item: [
                    { title: 'Media', image: 'https://example.com/thumbnail.jpg', enclosure_url: 'https://example.com/audio.mp3', enclosure_type: 'audio/mpeg' },
                    { title: 'Attachment', image: 'https://example.com/cover.png', attachments: [{ url: 'https://example.com/audio.mp3', mime_type: 'audio/mpeg' }] },
                ],
            },
            {}
        );
        expect(data.item[0].enclosure_type).toBe('audio/mpeg');
        expect(data.item[1].enclosure_type).toBeUndefined();
    });
});

describe('enclosure', () => {
    it('extracts direct media and downloads, preserving metadata and rejecting unsafe or untyped links', async () => {
        const data = await runMiddleware(
            {
                item: [
                    {
                        title: 'Media',
                        link: 'https://example.com/posts/one',
                        enclosure_url: 'https://example.com/audio.mp3',
                        enclosure_type: 'audio/mpeg',
                        enclosure_length: 123,
                        description:
                            '<img src="/cover.png"><video><source src="/stream?id=1" type="video/mp4"></video><audio src="/audio.mp3"></audio><a href="/report.pdf">Report</a><img data-src="/cover.png"><a href="/article">Article</a><video src="javascript:alert(1)" type="video/mp4"></video><img src="data:image/png;base64,abc"><a href="/constructor">Unknown</a>',
                    },
                ],
            },
            { enclosure: 'true' }
        );
        expect(data.item[0].attachments).toEqual([
            expect.objectContaining({ url: 'https://example.com/audio.mp3', mime_type: 'audio/mpeg', size_in_bytes: 123 }),
            { url: 'https://example.com/stream?id=1', mime_type: 'video/mp4' },
            { url: 'https://example.com/cover.png', mime_type: 'image/png' },
            { url: 'https://example.com/report.pdf', mime_type: 'application/pdf' },
        ]);
        expect(data.item[0].description).toContain('<video>');
    });

    it('keeps automatic extraction opt-in and respects hidden images', async () => {
        const original = await runMiddleware(makeImageData(), {});
        expect(original.item[0].attachments).toHaveLength(2);
        const extracted = await runMiddleware(makeImageData(), { enclosure: 'true', show_image: 'false' });
        expect(extracted.item[0].attachments.map((attachment) => attachment.mime_type)).toEqual(['audio/mpeg', 'video/mp4']);
    });
});

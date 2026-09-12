import type { Context } from 'hono';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { route } from '@/routes/hackernews/index';
import server from '@/setup.test';
import type { Data } from '@/types';
import cache from '@/utils/cache';
import type * as ParseDateModule from '@/utils/parse-date';
import { parseDate } from '@/utils/parse-date';

vi.mock('@/utils/parse-date', async (importOriginal) => {
    const actual = await importOriginal<typeof ParseDateModule>();
    return { ...actual, parseDate: vi.fn(actual.parseDate) };
});

const parseDateMock = vi.mocked(parseDate);

const createContext = (params: Record<string, string | undefined>, query: Record<string, string | undefined> = {}) =>
    ({
        req: {
            param: (name: string) => params[name],
            query: (name: string) => query[name],
        },
    }) as unknown as Context;

const runRoute = async (params: Record<string, string | undefined>, query: Record<string, string | undefined> = {}) => (await route.handler(createContext(params, query))) as Data;

const createStoryRow = (id: string, comments: number | string) => `
    <tr class="athing" id="${id}">
        <td class="title">
            <span class="titleline"><a href="https://example.com/${id}">Story ${id}</a><span class="sitestr">example.com</span></span>
        </td>
    </tr>
    <tr>
        <td class="subtext">
            <span class="score">10 points</span>
            <a class="hnuser">author</a>
            <span class="age" title="2026-08-31T00:00:00 000000"><a>1 hour ago</a></span>
            <a href="item?id=${id}">${typeof comments === 'number' ? `${comments}&nbsp;comments` : comments}</a>
        </td>
    </tr>
`;

const createStoryListHtml = (stories: Array<[string, number | string]>) => `
    <html>
        <head><title>Hacker News</title></head>
        <body>
            <table>
                ${stories.map(([id, comments]) => createStoryRow(id, comments)).join('')}
            </table>
        </body>
    </html>
`;

const createStoryHtml = (id: string, comments: number | string) => createStoryListHtml([[id, comments]]);

const mockHackerNews = (html: string, onRequest?: (url: URL) => void) => {
    server.use(
        http.get(/^https:\/\/news\.ycombinator\.com(?:\/.*)?$/, ({ request }) => {
            onRequest?.(new URL(request.url));
            return HttpResponse.text(html);
        })
    );
};

describe('Hacker News GUID compatibility', () => {
    const outputTypes = ['sources', 'comments', 'comments_list', 'unknown', undefined];
    // Expected suffixes from the route before minimum-comment filtering was added.
    const labels = [
        { html: 'discuss', suffix: '', count: 0 },
        { html: '', suffix: '-', count: 0 },
        { html: '22 days ago', suffix: '-22 days ago', count: 0 },
        { html: '1&nbsp;comment', suffix: '-1', count: 1 },
        { html: '10&nbsp;comments', suffix: '-10', count: 10 },
        { html: '10 comments', suffix: '-10 comments', count: 10 },
        { html: '010&nbsp;comments', suffix: '-010', count: 10 },
        { html: ' 10&nbsp;comments ', suffix: '- 10', count: 10 },
    ];

    beforeEach(() => {
        vi.spyOn(cache, 'tryGet').mockImplementation((_key, getValue) => getValue());
    });

    afterEach(() => {
        vi.mocked(cache.tryGet).mockRestore();
    });

    it.each(outputTypes)('preserves legacy GUIDs for output %s', async (type) => {
        mockHackerNews(createStoryListHtml(labels.map(({ html }, index) => [`40${index}`, html])));

        const result = await runRoute({ section: 'index', type });

        expect(result.item?.map((item) => item.guid)).toEqual(labels.map(({ suffix }, index) => `40${index}${type === 'sources' || type === undefined ? '' : suffix}`));
        expect(result.item?.map((item) => item.comments)).toEqual(labels.map(({ count }) => count));
    });

    it.each(outputTypes)('does not change retained GUIDs when filtering output %s', async (type) => {
        mockHackerNews(createStoryListHtml(labels.map(({ html }, index) => [`50${index}`, html])));

        const unfiltered = await runRoute({ section: 'index', type });
        const filtered = await runRoute({ section: 'index', type, value: '10' });

        expect(filtered.item?.map((item) => item.guid)).toEqual(unfiltered.item?.filter((item) => Number(item.comments) >= 10).map((item) => item.guid));
        expect(filtered.item).toHaveLength(4);
    });

    it('separates cached output formats even when their legacy GUIDs coincide', async () => {
        const entries = new Map<string, string>();
        const cacheMock = vi.spyOn(cache, 'tryGet').mockImplementation(async (key, getValue) => {
            if (!entries.has(key)) {
                entries.set(key, JSON.stringify(await getValue()));
            }
            return JSON.parse(entries.get(key)!);
        });
        mockHackerNews(createStoryHtml('6001', '10&nbsp;comments'));
        server.use(http.get('https://news.ycombinator.com/item', () => HttpResponse.text('<table><tr class="comtr"><td><span class="commtext">Full comment</span></td></tr></table>')));

        const comments = await runRoute({ type: 'comments' });
        const commentList = await runRoute({ type: 'comments_list' });
        const cachedComments = await runRoute({ type: 'comments', value: '10' });

        expect(comments.item?.[0].guid).toBe('6001-10');
        expect(commentList.item?.[0].guid).toBe('6001-10');
        expect(comments.item?.[0].description).toContain('Full comment');
        expect(commentList.item?.[0].description).not.toContain('Full comment');
        expect(cachedComments.item).toEqual(comments.item);
        expect(cacheMock.mock.calls.map(([key]) => key)).toEqual(['hackernews:comments:6001-10', 'hackernews:comments_list:6001-10', 'hackernews:comments:6001-10']);
        expect(entries.size).toBe(2);
    });
});

describe('Hacker News listing parameters', () => {
    it.each([
        { section: 'over', value: undefined, minComments: undefined, path: '/over?points=100', count: 2 },
        { section: 'over', value: '100', minComments: '10', path: '/over?points=100', count: 1 },
        { section: 'submitted', value: 'dang', minComments: '10', path: '/submitted?id=dang', count: 1 },
        { section: 'threads', value: 'dang', minComments: '10', path: '/threads?id=dang', count: 2 },
        { section: 'invited', value: '10', minComments: undefined, path: '/invited', count: 1 },
        { section: 'index', value: '10', minComments: '0', path: '/', count: 2 },
        { section: 'index', value: '10', minComments: '', path: '/', count: 2 },
        { section: 'index', value: '10', minComments: 'invalid', path: '/', count: 2 },
        { section: 'index', value: 'dang', minComments: undefined, path: '/?id=dang', count: 2 },
        { section: 'item', value: '7001', minComments: '10', path: '/item?id=7001', count: 1 },
        { section: 'other', value: '42', minComments: undefined, path: '/other?id=42', count: 2 },
    ])('preserves $section parameters with value=$value and minComments=$minComments', async ({ section, value, minComments, path, count }) => {
        const requestedUrls: string[] = [];
        mockHackerNews(
            createStoryListHtml([
                ['7001', 1],
                ['7002', 10],
            ]),
            (url) => {
                requestedUrls.push(url.href);
            }
        );

        const result = await runRoute({ section, type: 'sources', value, minComments });

        expect(requestedUrls).toEqual([`https://news.ycombinator.com${path}`]);
        expect(result.item).toHaveLength(count);
        expect(result.item?.map((item) => item.guid)).toEqual(count === 1 ? ['7002'] : ['7001', '7002']);
    });
});

describe('Hacker News minimum comment filter', () => {
    beforeEach(() => {
        parseDateMock.mockClear();
    });

    it('keeps a fully filtered listing subject to empty-feed checks', async () => {
        mockHackerNews(createStoryHtml('1001', 5));

        const result = await runRoute({ section: 'index', type: 'sources', value: '10' });

        expect(result.item).toEqual([]);
        expect(result).not.toHaveProperty('allowEmpty');
    });

    it('keeps an empty upstream listing reportable', async () => {
        mockHackerNews('<html><head><title>Hacker News</title></head><body></body></html>');

        const result = await runRoute({ section: 'index', type: 'sources', value: '10' });

        expect(result.item).toEqual([]);
        expect(result).not.toHaveProperty('allowEmpty');
    });

    it('keeps an unparseable comment listing reportable', async () => {
        mockHackerNews(createStoryHtml('1004', '22 days ago'));

        const result = await runRoute({ section: 'index', type: 'sources', value: '10' });

        expect(result.item).toEqual([]);
        expect(result).not.toHaveProperty('allowEmpty');
    });

    it('recognizes discuss links as zero-comment stories', async () => {
        mockHackerNews(createStoryHtml('1005', 'discuss'));

        const result = await runRoute({ section: 'index', type: 'sources', value: '1' });

        expect(result.item).toEqual([]);
        expect(result).not.toHaveProperty('allowEmpty');
    });

    it('does not fetch comment threads for discuss links', async () => {
        const requestedUrls: URL[] = [];
        mockHackerNews(createStoryHtml('1009', 'discuss'), (url) => {
            requestedUrls.push(url);
        });

        const result = await runRoute({ section: 'index', type: 'comments', value: '' });

        expect(requestedUrls).toHaveLength(1);
        expect(result.item).toHaveLength(1);
        expect(result.item?.[0].comments).toBe(0);
    });

    it('uses the explicit minimum-comments parameter without treating a numeric value as an ID', async () => {
        let requestedUrl: URL | undefined;
        mockHackerNews(createStoryHtml('1006', 5), (url) => {
            requestedUrl = url;
        });

        const result = await runRoute({ section: 'index', type: 'sources', value: '5', minComments: '10' });

        expect(requestedUrl?.search).toBe('');
        expect(result.item).toEqual([]);
        expect(result).not.toHaveProperty('allowEmpty');
    });

    it('does not allow an empty feed caused only by limit zero', async () => {
        mockHackerNews(createStoryHtml('1002', 15));

        const result = await runRoute({ section: 'index', type: 'sources', value: '10' }, { limit: '0' });

        expect(result.item).toEqual([]);
        expect(result).not.toHaveProperty('allowEmpty');
    });

    it('returns matching stories without enabling empty feeds', async () => {
        mockHackerNews(createStoryHtml('1003', 15));

        const result = await runRoute({ section: 'index', type: 'sources', value: '10' });

        expect(result.item).toHaveLength(1);
        expect(result).not.toHaveProperty('allowEmpty');
    });

    it('limits rows before parsing when the comment filter is disabled', async () => {
        const stories = Array.from({ length: 40 }, (_, index) => [`20${index.toString().padStart(2, '0')}`, 10] as [string, number]);
        mockHackerNews(createStoryListHtml(stories));

        const result = await runRoute({ section: 'item', type: 'sources', value: '2000' }, { limit: '5' });

        expect(result.item).toHaveLength(5);
        expect(parseDateMock).toHaveBeenCalledTimes(5);
    });

    it('filters the full listing before applying the limit', async () => {
        mockHackerNews(
            createStoryListHtml([
                ['3001', 1],
                ['3002', 10],
            ])
        );

        const result = await runRoute({ section: 'index', type: 'sources', value: '5' }, { limit: '1' });

        expect(result.item).toHaveLength(1);
        expect(result.item?.[0].title).toBe('Story 3002');
        expect(parseDateMock).toHaveBeenCalledTimes(2);
    });

    it('preserves numeric Hacker News IDs outside story-listing sections', async () => {
        let requestedUrl: URL | undefined;
        mockHackerNews(createStoryHtml('1007', 5), (url) => {
            requestedUrl = url;
        });

        const result = await runRoute({ section: 'item', type: 'sources', value: '1007' });

        expect(requestedUrl?.pathname).toBe('/item');
        expect(requestedUrl?.search).toBe('?id=1007');
        expect(result.item).toHaveLength(1);
    });

    it('preserves the existing behavior for unknown output types', async () => {
        mockHackerNews(createStoryHtml('1008', 5));

        const result = await runRoute({ section: 'index', type: 'unknown', value: '' });

        expect(result.item).toHaveLength(1);
        expect(result.item?.[0].link).toBe('https://news.ycombinator.com/item?id=1008');
    });

    it('rejects listing rows without a Hacker News item ID', async () => {
        mockHackerNews(createStoryHtml('', 5));

        await expect(runRoute({ section: 'index', type: 'sources', value: '' })).rejects.toThrow('Hacker News item is missing an ID');
    });
});

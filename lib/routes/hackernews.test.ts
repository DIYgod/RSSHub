import type { Context } from 'hono';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { route } from '@/routes/hackernews/index';
import server from '@/setup.test';
import type { Data } from '@/types';
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

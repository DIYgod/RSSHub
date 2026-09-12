import type { Context } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { route as eastmoney } from '../lib/routes/eastmoney/report';
import { route as hellogithub } from '../lib/routes/hellogithub';
import { route as iCable } from '../lib/routes/i-cable/news';
import { route as iandaily } from '../lib/routes/iandaily';
import { route as javbus } from '../lib/routes/javbus';
import { route as smzdm } from '../lib/routes/smzdm/keyword';
import { parseSearchDate } from '../lib/routes/smzdm/utils';
import type { Data, Route } from '../lib/types';

const mocks = vi.hoisted(() => ({ fetch: vi.fn(), request: vi.fn(), tryGet: vi.fn() }));
vi.mock('../lib/utils/got', () => ({ default: mocks.request }));
vi.mock('../lib/utils/ofetch', () => ({ default: mocks.fetch }));
vi.mock('../lib/utils/cache', () => ({ default: { tryGet: mocks.tryGet } }));
vi.mock('../lib/config', () => ({ config: { smzdm: { cookie: 'test-only-cookie' }, feature: { allow_user_supply_unsafe_domain: false }, cache: { routeExpire: 900 } } }));

const invoke = async (route: Route, path: string, params: Record<string, string> = {}) =>
    (await route.handler({ req: { path, query: vi.fn(), param: (name?: string) => (name ? params[name] : params) } } as unknown as Context)) as Data;

beforeEach(() => {
    vi.resetAllMocks();
    mocks.fetch.mockRejectedValue(new Error('Unexpected upstream fetch'));
    mocks.request.mockRejectedValue(new Error('Unexpected upstream request'));
    mocks.tryGet.mockImplementation(async (_key, callback) => await callback());
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('External network access is disabled')));
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

describe('explicit source dates', () => {
    it('interprets HelloGitHub wall clock dates as UTC+8 and preserves explicit offsets', async () => {
        mocks.request.mockResolvedValueOnce({
            data: { data: ['2026-08-28T08:07:22', '2026-08-28T00:07:22Z', '2026-08-28T08:07:22+08:00'].map((updated_at, index) => ({ item_id: String(index), name: 'Project', title: 'Summary', author: 'Author', updated_at })) },
        });
        const result = await invoke(hellogithub, '/hellogithub/home');
        expect(result.item.map((item) => (item.pubDate as Date).toISOString())).toEqual(Array.from({ length: 3 }, () => '2026-08-28T00:07:22.000Z'));
    });

    it('uses the WordPress GMT field as UTC and leaves absent dates absent', async () => {
        mocks.tryGet.mockResolvedValueOnce({ data: [{ id: 1, name: 'News', link: 'https://example.com/news' }] });
        mocks.request.mockResolvedValueOnce({
            data: ['2026-09-06T15:41:43', '2026-09-06T23:41:43+08:00', undefined].map((date_gmt) => ({
                title: { rendered: 'Title' },
                link: 'https://example.com/article',
                date_gmt,
                content: { rendered: '<p>Article</p>' },
                _embedded: { 'wp:term': [[]] },
            })),
        });
        const result = await invoke(iCable, '/i-cable/news');
        expect(result.item.slice(0, 2).map((item) => (item.pubDate as Date).toISOString())).toEqual(Array.from({ length: 2 }, () => '2026-09-06T15:41:43.000Z'));
        expect(result.item[2].pubDate).toBeUndefined();
    });

    it('corrects Eastmoney list dates even when full article entries were cached with the old host timezone', async () => {
        const cached = { title: 'Cached report', link: 'https://example.com/report.pdf', description: '<p>Cached body</p>', pubDate: '2026-09-07T00:00:00.000Z' };
        mocks.request.mockResolvedValueOnce({
            data: `<script>var initdata=${JSON.stringify({ data: [{ publishDate: '2026-09-07 00:00:00.000', orgSName: 'Org', title: 'Report', encodeUrl: 'id', researcher: 'Author' }] })};</script>`,
        });
        mocks.tryGet.mockResolvedValueOnce(cached);
        const result = await invoke(eastmoney, '/eastmoney/report/industry', { category: 'industry' });
        expect(result.item[0]).toMatchObject({ description: cached.description, link: cached.link, pubDate: new Date('2026-09-06T16:00:00Z') });
        expect(cached.pubDate).toBe('2026-09-07T00:00:00.000Z');
        expect(mocks.request).toHaveBeenCalledTimes(1);
    });

    it('preserves the Javbus calendar release date at UTC midnight on cache hits', async () => {
        const cached = { title: 'Cached release', link: 'https://www.javbus.com/release', description: '<p>Cached body</p>', pubDate: '2026-09-17T16:00:00.000Z' };
        mocks.request.mockResolvedValueOnce({ data: '<title>Releases</title><a class="movie-box" href="https://www.javbus.com/release"><date>release-id</date><date>2026-09-18</date></a>' });
        mocks.tryGet.mockResolvedValueOnce(cached);
        const result = await invoke(javbus, '/javbus/star/example');
        expect(result.item[0]).toMatchObject({ description: cached.description, pubDate: new Date('2026-09-18T00:00:00Z') });
        expect(cached.pubDate).toBe('2026-09-17T16:00:00.000Z');
        expect(mocks.request).toHaveBeenCalledTimes(1);
    });

    it('skips SMZDM layout rows without article links and resolves time-only dates in the source calendar day', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-09-06T18:10:00Z'));
        mocks.request.mockResolvedValueOnce({
            data: `
            <div class="feed-row-wide"><div class="feed-block-extras">00:40</div></div>
            <div class="feed-row-wide"><div class="feed-block-title"><a href="https://example.com/deal">Deal</a><a>Price</a></div>
            <div class="feed-block-extras">00:40<span>Source</span></div><div class="z-feed-img"><img src="//example.com/image.jpg"></div></div>`,
        });
        const result = await invoke(smzdm, '/smzdm/keyword/example', { keyword: 'example' });
        expect(result.item).toHaveLength(1);
        expect(result.item[0]).toMatchObject({ link: 'https://example.com/deal', title: 'Deal - Price', pubDate: new Date('2026-09-06T16:40:00Z') });
    });

    it('resolves SMZDM month/day values at the source year boundary', () => {
        const now = new Date('2025-12-31T18:10:00Z');
        expect(parseSearchDate('00:40', now)?.toISOString()).toBe('2025-12-31T16:40:00.000Z');
        expect(parseSearchDate('12-31 23:40', now)?.toISOString()).toBe('2025-12-31T15:40:00.000Z');
        expect(parseSearchDate('01-01 01:40', now)?.toISOString()).toBe('2025-12-31T17:40:00.000Z');
    });

    it('leaves unknown SMZDM dates absent instead of inventing the current time', () => {
        expect(parseSearchDate('')).toBeUndefined();
        expect(parseSearchDate('unknown')).toBeUndefined();
    });

    it('preserves date-only iandaily editions and renders every source column', async () => {
        const columnIds = ['ai', 'indie', 'product', 'taste', 'marketing', 'collab'];
        const dates = ['2026-09-10', '2026-09-09', '2026-09-08', '2026-09-07', '2026-09-06'];
        const editions = dates.map((date, editionIndex) => ({
            editionVersion: 2,
            date,
            overview: `Overview ${editionIndex}`,
            highlights: [`Highlight ${editionIndex}`],
            columns: Object.fromEntries(
                columnIds.map((columnId) => [
                    columnId,
                    [
                        {
                            title: `${columnId} title ${editionIndex}`,
                            judgment: `${columnId} judgment ${editionIndex}`,
                            url: `https://example.com/${columnId}/${editionIndex}`,
                            ...(columnId === 'ai' && { media: { image: '/digest/cover.jpg' } }),
                        },
                    ],
                ])
            ),
        }));
        const homepage = '<meta name="description" content="Daily description"><script type="module" src="/assets/index-test.js"></script>';
        const bundle = `const editionVersion=1,unrelated=JSON.parse('{"editionVersion":"metadata"}'),editions=JSON.parse(\`${JSON.stringify(editions)}\`);`;
        mocks.fetch.mockResolvedValueOnce(homepage).mockResolvedValueOnce(bundle);

        const result = await invoke(iandaily, '/iandaily');
        const items = result.item ?? [];
        expect(items).toHaveLength(5);
        expect(new Set(items.map((item) => item.guid)).size).toBe(5);
        expect(items[0]).toMatchObject({
            title: '伊恩日刊 · 2026-09-10',
            link: 'https://iandaily.xyz/d/2026-09-10',
            guid: 'https://iandaily.xyz/d/2026-09-10',
            author: '伊恩',
            category: ['AI 资讯', '一人公司', '产品设计', '审美提升', '产品营销', 'AI 协作'],
            image: 'https://iandaily.xyz/digest/cover.jpg',
            pubDate: new Date('2026-09-10T00:00:00.000Z'),
        });
        for (const columnId of columnIds) {
            expect(items[0].description).toContain(`${columnId} title 0`);
            expect(items[0].description).toContain(`https://example.com/${columnId}/0`);
        }
        expect(result).toMatchObject({ title: '伊恩日刊', description: 'Daily description', link: 'https://iandaily.xyz/' });
        expect(mocks.fetch).toHaveBeenNthCalledWith(1, 'https://iandaily.xyz/', { responseType: 'text' });
        expect(mocks.fetch).toHaveBeenNthCalledWith(2, 'https://iandaily.xyz/assets/index-test.js', { responseType: 'text' });
    });
});

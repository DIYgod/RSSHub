import type { Context } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { config } from '../lib/config';
import { route } from '../lib/routes/weibo/keyword';
import weiboUtils from '../lib/routes/weibo/utils';
import type { Data } from '../lib/types';

const mocks = vi.hoisted(() => ({ request: vi.fn(), tryGet: vi.fn(), entries: new Map<string, unknown>() }));
vi.mock('../lib/config', () => ({ config: { weibo: { cookies: '' }, cache: { routeExpire: 900 } } }));
vi.mock('../lib/utils/got', () => ({ default: mocks.request }));
vi.mock('../lib/utils/cache', () => ({ default: { tryGet: mocks.tryGet } }));
vi.mock('../lib/utils/logger', () => ({ default: { info: vi.fn(), warn: vi.fn() } }));
vi.mock('../lib/utils/playwright', () => ({ getPlaywrightPage: vi.fn() }));

const noResults = { data: { ok: 1, data: { cards: [{ card_type: 4, desc: '抱歉，未找到相关结果。' }] } } };
const status = {
    id: '5323566721532243',
    bid: 'R9T4Q6qBB',
    text: 'A post about RSSHub',
    created_at: 'Wed Jul 22 19:44:35 +0800 2026',
    user: { id: '1050089572', screen_name: 'Author' },
};
const responseWith = (...statuses: Array<Record<string, unknown>>) => ({ data: { ok: 1, data: { cards: statuses.map((mblog) => ({ card_type: 9, mblog })) } } });
const invoke = async (routeParams?: string) => (await route.handler({ req: { param: (name: string) => ({ keyword: 'RSSHub', routeParams })[name] } } as unknown as Context)) as Data;

beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    config.weibo.cookies = '';
    mocks.entries.clear();
    mocks.request.mockRejectedValue(new Error('Unexpected upstream request'));
    mocks.tryGet.mockImplementation(async (key, callback) => {
        if (mocks.entries.has(key)) {
            return mocks.entries.get(key);
        }
        const value = await callback();
        mocks.entries.set(key, value);
        return value;
    });
    vi.spyOn(weiboUtils, 'getCookies').mockResolvedValueOnce('SUB=stale-visitor').mockResolvedValue('SUB=fresh-visitor');
});

describe('Weibo keyword visitor sessions', () => {
    it('renews a visitor session that silently returns no results and caches only successful posts', async () => {
        mocks.entries.set('weibo:keyword:RSSHub', noResults.data.data.cards);
        mocks.request.mockResolvedValueOnce(noResults).mockResolvedValueOnce(responseWith(status));

        const feed = await invoke();
        const cachedFeed = await invoke();

        expect(feed.item).toHaveLength(1);
        expect(cachedFeed).toEqual(feed);
        expect(feed.item[0]).toMatchObject({ title: 'Author: A post about RSSHub', link: 'https://weibo.com/1050089572/R9T4Q6qBB', pubDate: new Date('2026-07-22T11:44:35Z') });
        expect(mocks.request).toHaveBeenCalledTimes(2);
        expect(mocks.request.mock.calls.map(([options]) => options.headers.Cookie)).toEqual(['SUB=stale-visitor', 'SUB=fresh-visitor']);
        expect(weiboUtils.getCookies).toHaveBeenNthCalledWith(2, expect.objectContaining({ name: 'RenewWeiboCookiesError' }));
        expect(mocks.entries.get('weibo:keyword-statuses:RSSHub')).toEqual([status]);
    });

    it('reports a genuinely empty search after one renewal without caching it', async () => {
        mocks.request.mockResolvedValue(noResults);

        await expect(invoke()).rejects.toThrow('Weibo keyword search returned no posts');
        expect(mocks.request).toHaveBeenCalledTimes(2);
        expect(weiboUtils.getCookies).toHaveBeenCalledTimes(2);
        expect(mocks.entries.size).toBe(0);
    });

    it('preserves configured account cookies when their keyword search has no results', async () => {
        config.weibo.cookies = 'SUB=configured-account';
        mocks.request.mockResolvedValue(noResults);

        await expect(invoke()).rejects.toThrow('Weibo keyword search returned no posts');
        expect(mocks.request).toHaveBeenCalledTimes(1);
        expect(weiboUtils.getCookies).toHaveBeenCalledExactlyOnceWith(false);
        expect(mocks.entries.size).toBe(0);
    });

    it('preserves explicit source offsets, missing dates, and formatting options without mutating cached statuses', async () => {
        const original = {
            ...status,
            retweeted_status: {
                ...status,
                id: '5314741212809485',
                bid: 'R6bu9bMSh',
                created_at: 'Sun Jun 28 11:15:11 +0800 2026',
                text: 'Original content',
            },
        };
        const undated = { ...status, id: 'undated-id', bid: 'undated-bid', created_at: undefined };
        const expected = structuredClone([original, undated]);
        mocks.request.mockResolvedValue(responseWith(original, undated));

        const feed = await invoke('showAuthorInTitle=0&showAuthorInDesc=0');
        const repeated = await invoke('showAuthorInTitle=0&showAuthorInDesc=0');

        expect(feed.item[0].title.startsWith('Author:')).toBe(false);
        expect(feed.item[0].pubDate).toEqual(new Date('2026-07-22T11:44:35Z'));
        expect(feed.item[1].pubDate).toBeUndefined();
        expect(repeated).toEqual(feed);
        expect(mocks.entries.get('weibo:keyword-statuses:RSSHub')).toEqual(expected);
        expect(original.retweeted_status.created_at).toBe('Sun Jun 28 11:15:11 +0800 2026');
    });

    it('reports malformed upstream responses without caching them', async () => {
        mocks.request.mockResolvedValue({ data: { ok: 0, msg: 'Search temporarily unavailable' } });

        await expect(invoke()).rejects.toThrow('Search temporarily unavailable');
        expect(mocks.entries.size).toBe(0);
    });
});

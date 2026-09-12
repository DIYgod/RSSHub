import type { Context } from 'hono';
import { createFetchError } from 'ofetch';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { route } from '../lib/routes/bilibili/ranking';
import type { Data } from '../lib/types';

const mocks = vi.hoisted(() => ({
    config: { bilibili: { excludeSubtitles: false } },
    ofetch: vi.fn(),
    getPlaywrightPage: vi.fn(),
    getVideoSubtitleAttachment: vi.fn(),
    renderUGCDescription: vi.fn(),
    getVideoUrl: vi.fn(),
}));

vi.mock('../lib/config', () => ({ config: mocks.config }));
vi.mock('../lib/utils/ofetch', () => ({ default: mocks.ofetch }));
vi.mock('../lib/utils/playwright', () => ({ getPlaywrightPage: mocks.getPlaywrightPage }));
vi.mock('../lib/routes/bilibili/cache', () => ({ default: { getVideoSubtitleAttachment: mocks.getVideoSubtitleAttachment } }));
vi.mock('../lib/routes/bilibili/utils', () => ({ default: { bvidTime: 1_585_108_800, renderUGCDescription: mocks.renderUGCDescription }, getVideoUrl: mocks.getVideoUrl }));

const apiBase = 'https://api.bilibili.com/x/web-interface/ranking/v2';
const allPage = 'https://www.bilibili.com/v/popular/rank/all';
const gamePage = 'https://www.bilibili.com/v/popular/rank/game';
const item = {
    aid: 1234,
    bvid: 'BV1rankingFixture',
    title: 'Ranking video',
    pic: 'https://example.com/cover.jpg',
    desc: 'Video description',
    ctime: 1_700_000_000,
    owner: { name: 'Video author' },
    duration: 125,
};
const ranking = { code: 0, data: { list: [item] } };

type BrowserResponse = { url: () => string; ok: () => boolean; status: () => number; json: () => Promise<unknown> };
type BrowserRoute = { request: () => { resourceType: () => string }; continue: () => Promise<void>; abort: () => Promise<void> };

function makeBrowser(rid = '0', body: unknown = ranking, status = 200) {
    const response = {
        url: () => `${apiBase}?rid=${rid}&type=all&w_rid=signed-fixture&wts=1700000000`,
        ok: () => status >= 200 && status < 300,
        status: () => status,
        json: vi.fn(() => Promise.resolve(body)),
    };
    const page = {
        route: vi.fn((_pattern: string, _handler: (route: BrowserRoute) => Promise<void>) => Promise.resolve()),
        waitForResponse: vi.fn((_predicate: (response: BrowserResponse) => boolean, _options: { timeout: number }) => Promise.resolve(response)),
        goto: vi.fn((_url: string, _options: { waitUntil: string; timeout: number }) => Promise.resolve(null)),
    };
    const destroy = vi.fn(() => Promise.resolve());
    mocks.getPlaywrightPage.mockResolvedValue({ page, destroy });
    return { page, response, destroy };
}

function httpError(status: number) {
    return createFetchError({ request: `${apiBase}?rid=0&type=all`, options: {}, response: new Response('Upstream error', { status }) });
}

const invoke = async (params: Record<string, string> = {}, query: Record<string, string> = {}) =>
    (await route.handler({ req: { param: (name?: string) => (name ? params[name] : params), query: (name: string) => query[name] } } as unknown as Context)) as Data;

beforeEach(() => {
    vi.resetAllMocks();
    mocks.config.bilibili.excludeSubtitles = false;
    mocks.ofetch.mockResolvedValue(ranking);
    mocks.getPlaywrightPage.mockRejectedValue(new Error('Unexpected browser request'));
    mocks.getVideoSubtitleAttachment.mockResolvedValue([]);
    mocks.renderUGCDescription.mockImplementation((_embed, _pic, description) => `<p>${description}</p>`);
    mocks.getVideoUrl.mockImplementation((bvid) => `https://example.com/player/${bvid}`);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('External network access is disabled')));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('Bilibili ranking browser recovery', () => {
    it.each([{}, { rid: '0' }, { rid: 'all' }])('keeps the native fast path and feed data for %j', async (params) => {
        const result = await invoke(params);

        expect(mocks.ofetch).toHaveBeenCalledExactlyOnceWith(`${apiBase}?rid=0&type=all&web_location=333.934`, { headers: { Referer: allPage, origin: 'https://www.bilibili.com' } });
        expect(mocks.getPlaywrightPage).not.toHaveBeenCalled();
        expect(mocks.getVideoSubtitleAttachment).not.toHaveBeenCalled();
        expect(result).toMatchObject({
            title: 'bilibili 排行榜-全站',
            link: allPage,
            item: [
                {
                    title: item.title,
                    description: '<p>Video description</p>',
                    author: item.owner.name,
                    link: `https://www.bilibili.com/video/${item.bvid}`,
                    image: item.pic,
                    pubDate: new Date('2023-11-14T22:13:20.000Z'),
                    attachments: [{ url: `https://example.com/player/${item.bvid}`, mime_type: 'text/html', duration_in_seconds: 125 }],
                },
            ],
        });
        expect(mocks.renderUGCDescription).toHaveBeenCalledExactlyOnceWith(true, item.pic, item.desc, item.aid, undefined, item.bvid);
    });

    it.each([
        { params: {}, rid: '0', browserLink: allPage, feedLink: allPage, title: '全站' },
        { params: { rid: '0' }, rid: '0', browserLink: allPage, feedLink: allPage, title: '全站' },
        { params: { rid: 'all' }, rid: '0', browserLink: allPage, feedLink: allPage, title: '全站' },
        { params: { rid: 'game' }, rid: '1008', browserLink: gamePage, feedLink: gamePage, title: '游戏' },
        { params: { rid: '1008' }, rid: '1008', browserLink: gamePage, feedLink: allPage, title: '游戏' },
    ])('recovers HTTP 412 on the correct official page for $params', async ({ params, rid, browserLink, feedLink, title }) => {
        mocks.ofetch.mockRejectedValue(httpError(412));
        const { page, destroy } = makeBrowser(rid);

        const result = await invoke(params);

        expect(mocks.ofetch).toHaveBeenCalledTimes(1);
        expect(mocks.ofetch.mock.calls[0][0]).toBe(`${apiBase}?rid=${rid}&type=all&web_location=333.934`);
        expect(mocks.getPlaywrightPage).toHaveBeenCalledExactlyOnceWith(browserLink, { noGoto: true, closeTimeout: 0 });
        expect(page.goto).toHaveBeenCalledExactlyOnceWith(browserLink, { waitUntil: 'domcontentloaded', timeout: 30000 });
        expect(page.waitForResponse).toHaveBeenCalledExactlyOnceWith(expect.any(Function), { timeout: 30000 });
        expect(page.waitForResponse.mock.invocationCallOrder[0]).toBeLessThan(page.goto.mock.invocationCallOrder[0]);
        expect(destroy).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ title: `bilibili 排行榜-${title}`, link: feedLink, item: [{ title: item.title, author: item.owner.name }] });
    });

    it.each(['0', 'all', 'game', '1008'])('recovers application risk-control code -352 for %s', async (rid) => {
        mocks.ofetch.mockResolvedValue({ code: -352, message: 'Risk control' });
        const { destroy } = makeBrowser(rid === '0' || rid === 'all' ? '0' : '1008');

        expect((await invoke({ rid })).item).toHaveLength(1);
        expect(mocks.ofetch).toHaveBeenCalledTimes(1);
        expect(mocks.getPlaywrightPage).toHaveBeenCalledTimes(1);
        expect(destroy).toHaveBeenCalledTimes(1);
    });

    it.each([403, 404, 429, 500])('does not hide HTTP %s behind browser recovery', async (status) => {
        const failure = httpError(status);
        mocks.ofetch.mockRejectedValue(failure);

        await expect(invoke({ rid: '0' })).rejects.toBe(failure);
        expect(mocks.getPlaywrightPage).not.toHaveBeenCalled();
    });

    it('preserves native network failures and does not mistake an arbitrary status property for an HTTP failure', async () => {
        const failure = Object.assign(new Error('Network unavailable'), { status: 412 });
        mocks.ofetch.mockRejectedValue(failure);

        await expect(invoke()).rejects.toBe(failure);
        expect(mocks.getPlaywrightPage).not.toHaveBeenCalled();
    });

    it.each([-400, -403, -404])('preserves non-risk application error %s', async (code) => {
        mocks.ofetch.mockResolvedValue({ code, message: 'Upstream application error' });

        await expect(invoke()).rejects.toThrow('Upstream application error');
        expect(mocks.getPlaywrightPage).not.toHaveBeenCalled();
    });

    it.each(['9999', '1'])('does not substitute the all ranking for numeric rid %s without a supported official page', async (rid) => {
        const failure = httpError(412);
        mocks.ofetch.mockRejectedValue(failure);
        await expect(invoke({ rid })).rejects.toBe(failure);

        mocks.ofetch.mockResolvedValue({ code: -352, message: 'Risk control' });
        await expect(invoke({ rid })).rejects.toThrow('Risk control');
        expect(mocks.getPlaywrightPage).not.toHaveBeenCalled();
    });

    it('allows only document, script, XHR and fetch resources needed to initialize the official page', async () => {
        mocks.ofetch.mockResolvedValue({ code: -352 });
        const { page } = makeBrowser();
        await invoke();
        expect(page.route).toHaveBeenCalledExactlyOnceWith('**/*', expect.any(Function));
        const handler = page.route.mock.calls[0][1];

        await Promise.all(
            ['document', 'script', 'xhr', 'fetch', 'image', 'media', 'font', 'stylesheet', 'websocket', 'other'].map(async (resourceType) => {
                const request = { request: () => ({ resourceType: () => resourceType }), continue: vi.fn(() => Promise.resolve()), abort: vi.fn(() => Promise.resolve()) };
                await handler(request);
                const allowed = ['document', 'script', 'xhr', 'fetch'].includes(resourceType);
                expect(request.continue).toHaveBeenCalledTimes(allowed ? 1 : 0);
                expect(request.abort).toHaveBeenCalledTimes(allowed ? 0 : 1);
            })
        );
    });

    it('matches only the requested ranking origin, path, rid and type while allowing page-generated signatures', async () => {
        mocks.ofetch.mockResolvedValue({ code: -352 });
        const { page, response } = makeBrowser('1008');
        await invoke({ rid: 'game' });
        const matches = page.waitForResponse.mock.calls[0][0];

        expect(matches(response)).toBe(true);
        expect(matches({ ...response, url: () => `${apiBase}?w_rid=another-signature&type=all&web_location=333.934&rid=1008` })).toBe(true);
        for (const url of [
            `${apiBase}?rid=0&type=all`,
            `${apiBase}?rid=1008&type=origin`,
            `${apiBase}?rid=1008`,
            `${apiBase}?type=all`,
            `${apiBase}/other?rid=1008&type=all`,
            `${apiBase.replace('/ranking/v2', '/popular')}?rid=1008&type=all`,
            `${apiBase.replace('https:', 'http:')}?rid=1008&type=all`,
            `${apiBase.replace('api.bilibili.com', 'api.bilibili.com.evil.test')}?rid=1008&type=all`,
            `${apiBase.replace('api.bilibili.com', 'api.bilibili.com:8443')}?rid=1008&type=all`,
        ]) {
            expect(matches({ ...response, url: () => url }), url).toBe(false);
        }
    });

    it('propagates browser setup failures', async () => {
        mocks.ofetch.mockRejectedValue(httpError(412));
        const failure = new Error('Browser unavailable');
        mocks.getPlaywrightPage.mockRejectedValue(failure);

        await expect(invoke()).rejects.toBe(failure);
        expect(mocks.getPlaywrightPage).toHaveBeenCalledTimes(1);
    });

    it.each(['route', 'waitForResponse', 'goto', 'json'] as const)('awaits browser cleanup when %s fails', async (stage) => {
        mocks.ofetch.mockResolvedValue({ code: -352 });
        const { page, response, destroy } = makeBrowser();
        const failure = new Error(`${stage} failed`);
        const operation = stage === 'json' ? response.json : page[stage];
        operation.mockRejectedValue(failure);
        const cleanup = Promise.withResolvers<void>();
        destroy.mockReturnValue(cleanup.promise);
        const result = invoke();
        const assertion = expect(result).rejects.toBe(failure);
        let finished = false;
        void result
            .then(() => {
                finished = true;
            })
            .catch(() => {
                finished = true;
            });

        await vi.waitFor(() => expect(destroy).toHaveBeenCalledTimes(1));
        expect(finished).toBe(false);
        cleanup.resolve();
        await assertion;
        expect(mocks.getPlaywrightPage).toHaveBeenCalledTimes(1);
    });

    it.each([403, 412, 500])('reports browser HTTP %s and closes the browser without parsing the error body', async (status) => {
        mocks.ofetch.mockResolvedValue({ code: -352 });
        const { response, destroy } = makeBrowser('0', ranking, status);

        await expect(invoke()).rejects.toThrow(`Bilibili ranking browser request failed with HTTP ${status}`);
        expect(response.json).not.toHaveBeenCalled();
        expect(destroy).toHaveBeenCalledTimes(1);
        expect(mocks.getPlaywrightPage).toHaveBeenCalledTimes(1);
    });

    it.each([-352, -400])('does not swallow or repeatedly retry browser application error %s', async (code) => {
        mocks.ofetch.mockRejectedValue(httpError(412));
        const { destroy } = makeBrowser('0', { code, message: 'Browser application error' });

        await expect(invoke()).rejects.toThrow('Browser application error');
        expect(destroy).toHaveBeenCalledTimes(1);
        expect(mocks.getPlaywrightPage).toHaveBeenCalledTimes(1);
        expect(mocks.ofetch).toHaveBeenCalledTimes(1);
    });

    it('does not turn a malformed browser payload into an empty successful feed', async () => {
        mocks.ofetch.mockResolvedValue({ code: -352 });
        const { destroy } = makeBrowser('0', { code: 0 });

        await expect(invoke()).rejects.toThrow();
        expect(destroy).toHaveBeenCalledTimes(1);
    });
});

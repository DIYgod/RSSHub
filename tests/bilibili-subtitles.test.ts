import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import biliCache from '../lib/routes/bilibili/cache';
import { apiRoute } from '../lib/routes/bilibili/check-cookie';
import { getSrtAttachment, getSrtAttachmentBatch, getSubtitlesByVideoId } from '../lib/routes/youtube/api/subtitles';
import { isWorker } from '../lib/utils/is-worker';

const mocks = vi.hoisted(() => ({
    config: { bilibili: { cookies: { '1': 'test-cookie' }, excludeSubtitles: false } },
    cached: new Map<string, unknown>(),
    tryGet: vi.fn(),
    got: vi.fn(),
    ofetch: vi.fn(),
    removeTokens: vi.fn(),
    getPlaywrightPage: vi.fn(),
    getSubtitles: vi.fn(),
}));

vi.mock('../lib/config', () => ({ config: mocks.config }));
vi.mock('../lib/utils/cache', () => ({ default: { tryGet: mocks.tryGet } }));
vi.mock('../lib/utils/got', () => ({ default: mocks.got }));
vi.mock('../lib/utils/ofetch', () => ({ default: mocks.ofetch }));
vi.mock('../lib/utils/playwright', () => ({ getPlaywrightPage: mocks.getPlaywrightPage }));
vi.mock('../lib/utils/logger', () => ({ default: {} }));
vi.mock('../lib/routes/bilibili/utils', () => ({ default: { lsid: vi.fn() } }));
vi.mock('youtube-caption-extractor', () => ({ getSubtitles: mocks.getSubtitles }));
vi.mock('rate-limiter-flexible', () => ({
    RateLimiterMemory: class {},
    RateLimiterQueue: class {
        removeTokens = mocks.removeTokens;
    },
}));

const bvid = 'BV1testvideo';
const subtitleUrl = 'https://subtitle.test/caption.json';
const expectedSrt = '1\n00:00:00,250 --> 00:00:01,750\nHello & 字幕\n\n2\n00:01:01,125 --> 00:01:03,625\nSecond caption\n';
const subtitleResult = [{ content: expectedSrt, lan_doc: '中文' }];
const app = new Hono().get('/check-cookie', async (c) => c.json(await apiRoute.handler(c)));

beforeEach(() => {
    vi.resetAllMocks();
    mocks.config.bilibili.excludeSubtitles = false;
    mocks.config.bilibili.cookies = { '1': 'test-cookie' };
    mocks.cached.clear();
    mocks.tryGet.mockImplementation((key: string, getValue: () => Promise<unknown>) => (mocks.cached.has(key) ? Promise.resolve(mocks.cached.get(key)) : getValue()));
    mocks.got.mockImplementation((url: string) => {
        if (url === `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`) {
            return Promise.resolve({ data: { data: { pages: [{ cid: 42 }] } } });
        }
        if (url === `https://api.bilibili.com/x/player/wbi/v2?bvid=${bvid}&cid=42`) {
            return Promise.resolve({ data: { data: { subtitle: { subtitles: [{ subtitle_url: '//subtitle.test/caption.json', lan_doc: '中文' }] } } } });
        }
        if (url === subtitleUrl) {
            return Promise.resolve({
                data: {
                    body: [
                        { from: 0.25, to: 1.75, content: 'Hello & 字幕' },
                        { from: 61.125, to: 63.625, content: 'Second caption' },
                    ],
                },
            });
        }
        throw new Error('Unexpected HTTP request in subtitle test');
    });
    mocks.ofetch.mockResolvedValue({ code: 0, data: { mid: 42, permission: '1', subtitle: { subtitles: [{ lan_doc: '中文' }] } } });
});

describe.runIf(isWorker)('Worker subtitle restrictions', () => {
    it('skips Bilibili subtitle and attachment requests even when explicitly enabled and already cached', async () => {
        mocks.cached.set(`bili-cid-from-id-${bvid}-1`, 42);
        mocks.cached.set(`bili-video-subtitle-${bvid}`, subtitleResult);

        expect(mocks.config.bilibili.excludeSubtitles).toBe(false);
        expect(await biliCache.getVideoSubtitle(bvid)).toEqual([]);
        expect(await biliCache.getVideoSubtitleAttachment(bvid)).toEqual([]);
        expect(mocks.got).not.toHaveBeenCalled();
        expect(mocks.tryGet).not.toHaveBeenCalled();
        expect(mocks.removeTokens).not.toHaveBeenCalled();
        expect(mocks.getPlaywrightPage).not.toHaveBeenCalled();
    });

    it.each([
        { code: 0, data: { mid: 42 }, expected: 0 },
        { code: -101, data: {}, expected: -1 },
    ])('checks cookie login validity without requesting subtitle permissions: $expected', async ({ code, data, expected }) => {
        mocks.ofetch.mockResolvedValue({ code, data });

        expect(await (await app.request('/check-cookie')).json()).toEqual({ code: expected });
        expect(mocks.ofetch).toHaveBeenCalledExactlyOnceWith('https://api.bilibili.com/x/web-interface/nav', {
            headers: { Referer: 'https://space.bilibili.com/1/', Cookie: 'test-cookie' },
        });
    });

    it('keeps every YouTube subtitle entry point disabled with the real Worker override', async () => {
        mocks.cached.set('youtube:getSubtitlesByVideoId:cached', expectedSrt);

        expect(await getSubtitlesByVideoId('cached')).toBe('');
        expect(await getSrtAttachment('cached')).toEqual([]);
        expect(await getSrtAttachmentBatch(['cached', 'fresh'])).toEqual({});
        expect(mocks.tryGet).not.toHaveBeenCalled();
        expect(mocks.getSubtitles).not.toHaveBeenCalled();
    });
});

describe.runIf(!isWorker)('Node Bilibili subtitle behavior', () => {
    it('keeps the default CID, subtitle metadata and subtitle download flow and SRT conversion', async () => {
        expect(await biliCache.getVideoSubtitle(bvid)).toEqual(subtitleResult);
        expect(mocks.got).toHaveBeenCalledTimes(3);
        expect(mocks.got).toHaveBeenNthCalledWith(2, `https://api.bilibili.com/x/player/wbi/v2?bvid=${bvid}&cid=42`, {
            headers: { Referer: `https://www.bilibili.com/video/${bvid}`, Cookie: 'test-cookie' },
        });
        expect(mocks.got).toHaveBeenNthCalledWith(3, subtitleUrl);
        expect(mocks.removeTokens).toHaveBeenCalledExactlyOnceWith(1);
        expect(mocks.tryGet.mock.calls.map(([key]) => key)).toEqual([`bili-cid-from-id-${bvid}-1`, `bili-video-subtitle-${bvid}`, subtitleUrl]);
    });

    it('preserves cached subtitles as SRT attachments without HTTP requests', async () => {
        mocks.cached.set(`bili-cid-from-id-${bvid}-1`, 42);
        mocks.cached.set(`bili-video-subtitle-${bvid}`, subtitleResult);

        expect(await biliCache.getVideoSubtitleAttachment(bvid)).toEqual([{ url: `data:text/plain;charset=utf-8,${encodeURIComponent(expectedSrt)}`, mime_type: 'text/srt', title: '字幕 - 中文' }]);
        expect(mocks.got).not.toHaveBeenCalled();
        expect(mocks.removeTokens).not.toHaveBeenCalled();
    });

    it('continues checking subtitle permissions as well as login validity on Node', async () => {
        expect(await (await app.request('/check-cookie')).json()).toEqual({ code: 0 });
        expect(mocks.ofetch).toHaveBeenCalledTimes(2);
        expect(mocks.ofetch).toHaveBeenNthCalledWith(2, 'https://api.bilibili.com/x/player/wbi/v2?bvid=BV1iU411o7R2&cid=1550543560', {
            headers: { Referer: 'https://www.bilibili.com/video/BV1iU411o7R2', Cookie: 'test-cookie' },
        });
    });

    it('keeps rejecting cookies without subtitle access on Node', async () => {
        mocks.ofetch.mockResolvedValueOnce({ code: 0, data: { mid: 42 } }).mockResolvedValueOnce({ data: { permission: '0', subtitle: { subtitles: [] } } });

        expect(await (await app.request('/check-cookie')).json()).toEqual({ code: -1 });
        expect(mocks.ofetch).toHaveBeenCalledTimes(2);
    });
});

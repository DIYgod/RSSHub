import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    cacheGet: vi.fn(),
    cacheSet: vi.fn(),
    cacheTryGet: vi.fn(),
    destroy: vi.fn(),
    getPlaywrightPage: vi.fn(),
    got: vi.fn(),
    jsdomLoaded: vi.fn(),
    playwrightLoaded: vi.fn(),
}));

const configMock = vi.hoisted(() => ({
    bilibili: {
        cookies: {} as Record<string, string>,
    },
}));

vi.mock('@/config', () => ({ config: configMock }));
vi.mock('@/utils/cache', () => ({
    default: {
        get: mocks.cacheGet,
        set: mocks.cacheSet,
        tryGet: mocks.cacheTryGet,
    },
}));
vi.mock('@/utils/got', () => ({ default: mocks.got }));
vi.mock('@/utils/logger', () => ({
    default: {
        debug: vi.fn(),
        error: vi.fn(),
    },
}));
vi.mock('@/utils/playwright', () => {
    mocks.playwrightLoaded();
    return { getPlaywrightPage: mocks.getPlaywrightPage };
});
vi.mock('jsdom', () => {
    mocks.jsdomLoaded();
    return { JSDOM: class {} };
});

describe('Bilibili cache helpers', () => {
    beforeEach(() => {
        vi.resetModules();
        mocks.cacheGet.mockReset();
        mocks.cacheSet.mockReset();
        mocks.cacheTryGet.mockReset().mockImplementation((_key, getter) => getter());
        mocks.destroy.mockReset();
        mocks.getPlaywrightPage.mockReset().mockResolvedValue({ destroy: mocks.destroy });
        mocks.got.mockReset();
        mocks.jsdomLoaded.mockClear();
        mocks.playwrightLoaded.mockClear();

        for (const key of Object.keys(configMock.bilibili.cookies)) {
            delete configMock.bilibili.cookies[key];
        }
    });

    it('does not load JSDOM or Playwright when the cache module is imported', async () => {
        await import('@/routes/bilibili/cache');

        expect(mocks.jsdomLoaded).not.toHaveBeenCalled();
        expect(mocks.playwrightLoaded).not.toHaveBeenCalled();
    });

    it('parses the access id from render data without JSDOM', async () => {
        configMock.bilibili.cookies.account = 'SESSDATA=test';
        const renderData = encodeURIComponent(JSON.stringify({ access_id: 'access-id' }));
        mocks.got.mockResolvedValueOnce({
            data: `<html><body><script id="__RENDER_DATA__">${renderData}</script></body></html>`,
        });

        const { default: bilibiliCache } = await import('@/routes/bilibili/cache');

        await expect(bilibiliCache.getRenderData('1')).resolves.toBe('access-id');
        expect(mocks.jsdomLoaded).not.toHaveBeenCalled();
    });

    it('fetches the public WBI key without a cookie or browser', async () => {
        const permutation = Array.from({ length: 64 }, (_, index) => index);
        mocks.got.mockImplementation((url) => {
            if (url === 'https://api.bilibili.com/x/web-interface/nav') {
                return {
                    data: {
                        data: {
                            wbi_img: {
                                img_url: 'https://i0.hdslb.com/bfs/wbi/abc.png',
                                sub_url: 'https://i0.hdslb.com/bfs/wbi/def.png',
                            },
                        },
                    },
                };
            }

            return { body: `const permutation = ${JSON.stringify(permutation)};` };
        });

        const { default: bilibiliCache } = await import('@/routes/bilibili/cache');

        await expect(bilibiliCache.getWbiVerifyString()).resolves.toBe('abcdef');
        expect(mocks.getPlaywrightPage).not.toHaveBeenCalled();
        expect(mocks.got).toHaveBeenCalledWith('https://api.bilibili.com/x/web-interface/nav', {
            headers: {
                Referer: 'https://www.bilibili.com/',
            },
        });
    });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    configuredCookies: '',
    tryGet: vi.fn(),
    set: vi.fn(),
    getPlaywrightPage: vi.fn(),
    getCookies: vi.fn(),
    destroy: vi.fn(),
}));

vi.mock('../lib/config', () => ({
    config: {
        weibo: {
            get cookies() {
                return mocks.configuredCookies;
            },
        },
        cache: { routeExpire: 300, contentExpire: 3600 },
    },
}));
vi.mock('../lib/utils/cache', () => ({ default: { tryGet: mocks.tryGet, set: mocks.set } }));
vi.mock('../lib/utils/got', () => ({ default: vi.fn() }));
vi.mock('../lib/utils/logger', () => ({ default: { info: vi.fn(), warn: vi.fn() } }));
vi.mock('../lib/utils/playwright', () => ({ getPlaywrightPage: mocks.getPlaywrightPage }));
vi.mock('../lib/utils/playwright-utils', () => ({ getCookies: mocks.getCookies }));

beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    vi.useFakeTimers();
    mocks.configuredCookies = '';
    mocks.tryGet.mockImplementation(async (_key, callback) => await callback());
    mocks.set.mockResolvedValue(undefined);
    mocks.getCookies.mockResolvedValue('SUB=fresh-visitor');
    mocks.destroy.mockResolvedValue(undefined);
    mocks.getPlaywrightPage.mockImplementation(async (url, options) => {
        const page = {
            setExtraHTTPHeaders: vi.fn(),
            route: vi.fn(),
            url: () => url,
        };
        await options.onBeforeLoad(page);
        const intercept = page.route.mock.calls[0][1];
        const request = { request: () => ({ resourceType: () => 'document', url: () => url }), continue: vi.fn(), abort: vi.fn() };
        intercept(request);
        intercept(request);
        return { page, destroy: mocks.destroy };
    });
});

afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
});

describe('Weibo visitor cookie renewal', () => {
    it('bypasses stale cached cookies and waits for the replacement without a one-second invalidation', async () => {
        mocks.tryGet.mockResolvedValue('SUB=stale-visitor');
        const { promise: writeStarted, resolve: startWrite } = Promise.withResolvers<void>();
        const { promise: writeReleased, resolve: releaseWrite } = Promise.withResolvers<void>();
        mocks.set.mockImplementation(() => {
            startWrite();
            return writeReleased;
        });
        const { default: weiboUtils } = await import('../lib/routes/weibo/utils');
        const settled = vi.fn();
        const renewal = (async () => {
            const cookies = await weiboUtils.getCookies(new Error('Cookies expired'));
            settled();
            return cookies;
        })();

        await writeStarted;
        const concurrentRenewal = weiboUtils.getCookies(true);
        try {
            expect(mocks.tryGet).not.toHaveBeenCalled();
            expect(mocks.set).toHaveBeenCalledExactlyOnceWith('weibo:visitor-cookies', 'SUB=fresh-visitor');
            expect(settled).not.toHaveBeenCalled();
            expect(mocks.destroy).toHaveBeenCalledOnce();
        } finally {
            releaseWrite();
        }
        await expect(Promise.all([renewal, concurrentRenewal])).resolves.toEqual(['SUB=fresh-visitor', 'SUB=fresh-visitor']);
    });

    it('keeps ordinary cache hits free of browser work', async () => {
        mocks.tryGet.mockResolvedValue('SUB=cached-visitor');
        const { default: weiboUtils } = await import('../lib/routes/weibo/utils');

        await expect(weiboUtils.getCookies()).resolves.toBe('SUB=cached-visitor');
        expect(mocks.getPlaywrightPage).not.toHaveBeenCalled();
        expect(mocks.set).not.toHaveBeenCalled();
    });

    it('reuses one browser for concurrent renewals and preserves the cooldown', async () => {
        const { default: weiboUtils } = await import('../lib/routes/weibo/utils');

        await expect(Promise.all([weiboUtils.getCookies(true), weiboUtils.getCookies(true)])).resolves.toEqual(['SUB=fresh-visitor', 'SUB=fresh-visitor']);
        expect(mocks.getPlaywrightPage).toHaveBeenCalledOnce();
        expect(mocks.destroy).toHaveBeenCalledOnce();
        expect(mocks.set).toHaveBeenCalledExactlyOnceWith('weibo:visitor-cookies', 'SUB=fresh-visitor');

        const expired = new Error('Cookies expired again');
        await expect(weiboUtils.getCookies(expired)).rejects.toBe(expired);
        expect(mocks.getPlaywrightPage).toHaveBeenCalledOnce();

        await vi.advanceTimersByTimeAsync(300 * 1000);
        await expect(weiboUtils.getCookies(true)).resolves.toBe('SUB=fresh-visitor');
        expect(mocks.getPlaywrightPage).toHaveBeenCalledTimes(2);
    });

    it('closes the browser and preserves the old cache when extracting replacement cookies fails', async () => {
        mocks.getCookies.mockRejectedValue(new Error('Cookie extraction failed'));
        const { default: weiboUtils } = await import('../lib/routes/weibo/utils');

        await expect(weiboUtils.getCookies(true)).rejects.toThrow('Cookie extraction failed');
        expect(mocks.destroy).toHaveBeenCalledOnce();
        expect(mocks.set).not.toHaveBeenCalled();
    });

    it('requires an explicit update when configured cookies expire', async () => {
        mocks.configuredCookies = 'SUB=configured';
        const { default: weiboUtils } = await import('../lib/routes/weibo/utils');

        await expect(weiboUtils.getCookies()).resolves.toBe('SUB=configured');
        await expect(weiboUtils.getCookies(true)).rejects.toThrow('Cookies expired. Please update WEIBO_COOKIES');
        expect(mocks.tryGet).not.toHaveBeenCalled();
        expect(mocks.set).not.toHaveBeenCalled();
        expect(mocks.getPlaywrightPage).not.toHaveBeenCalled();
    });

    it('does not mistake repeated empty searches for configured cookie expiry', async () => {
        mocks.configuredCookies = 'SUB=configured';
        const { default: weiboUtils } = await import('../lib/routes/weibo/utils');
        const noResults = new Error('Weibo keyword search returned no posts.');
        const callback = vi.fn().mockRejectedValue(noResults);

        for (let attempt = 0; attempt < 12; attempt++) {
            // Requests must complete in order to exercise the accumulated error count.
            // eslint-disable-next-line no-await-in-loop
            await expect(weiboUtils.tryWithCookies(callback)).rejects.toBe(noResults);
        }

        expect(callback).toHaveBeenCalledTimes(12);
        expect(mocks.tryGet).not.toHaveBeenCalled();
        expect(mocks.set).not.toHaveBeenCalled();
        expect(mocks.getPlaywrightPage).not.toHaveBeenCalled();

        await expect(
            weiboUtils.tryWithCookies((_cookies, verifier) => {
                verifier({ data: { ok: -100 } });
                return Promise.resolve();
            })
        ).rejects.toThrow('Cookies expired. Please update WEIBO_COOKIES');
    });
});

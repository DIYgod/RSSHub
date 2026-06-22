import { afterEach, describe, expect, it, vi } from 'vitest';

const createDeferred = <T>() => {
    const { promise, reject, resolve } = Promise.withResolvers<T>();

    return { promise, reject, resolve };
};

const loadWeiboUtils = async ({ pageReady = Promise.resolve() } = {}) => {
    vi.resetModules();

    const store = new Map<string, string>();
    const cache = {
        get: vi.fn((key: string) => store.get(key) || null),
        has: vi.fn((key: string) => store.has(key)),
        set: vi.fn((key: string, value?: string | Record<string, unknown>) => {
            store.set(key, typeof value === 'object' ? JSON.stringify(value) : value || '');
        }),
        tryGet: vi.fn(async (key: string, getValue: () => Promise<string>) => {
            const cached = store.get(key);
            if (cached) {
                return cached;
            }
            const value = await getValue();
            store.set(key, JSON.stringify(value));
            return value;
        }),
    };
    const destroy = vi.fn();
    const page = {
        route: vi.fn((_pattern: string, handler: (route: any) => void) => {
            for (const requestUrl of ['https://m.weibo.cn/', 'https://m.weibo.cn/']) {
                handler({
                    abort: vi.fn(),
                    continue: vi.fn(),
                    request: () => ({
                        resourceType: () => 'document',
                        url: () => requestUrl,
                    }),
                });
            }
        }),
        setExtraHTTPHeaders: vi.fn(),
        url: vi.fn(() => 'https://m.weibo.cn/'),
    };
    const getPlaywrightPage = vi.fn(async (_url: string, options: any) => {
        await pageReady;
        await options.onBeforeLoad(page);
        return { destroy, page };
    });
    const getCookies = vi.fn(() => Promise.resolve('SUB=mock'));

    vi.doMock('@/config', () => ({
        config: {
            cache: {
                contentExpire: 3600,
                routeExpire: 300,
            },
            weibo: {},
        },
    }));
    vi.doMock('@/utils/cache', () => ({ default: cache }));
    vi.doMock('@/utils/logger', () => ({
        default: {
            info: vi.fn(),
            warn: vi.fn(),
        },
    }));
    vi.doMock('@/utils/playwright', () => ({ getPlaywrightPage }));
    vi.doMock('@/utils/playwright-utils', () => ({ getCookies }));

    const { default: weiboUtils } = await import('./utils');

    return {
        cache,
        getCookies,
        getPlaywrightPage,
        weiboUtils,
    };
};

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.resetModules();
});

describe('weibo utils', () => {
    it('shares an in-flight visitor cookie fetch across concurrent callers', async () => {
        vi.useFakeTimers();
        const pageReady = createDeferred<void>();
        const { getPlaywrightPage, weiboUtils } = await loadWeiboUtils({ pageReady: pageReady.promise });

        const first = weiboUtils.getCookies();
        const second = weiboUtils.getCookies();
        pageReady.resolve();

        await expect(Promise.all([first, second])).resolves.toEqual(['SUB=mock', 'SUB=mock']);
        expect(getPlaywrightPage).toHaveBeenCalledTimes(1);
    });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

import biliCache from '../lib/routes/bilibili/cache';
import cache from '../lib/utils/cache';
import got from '../lib/utils/got';

vi.mock('../lib/config', () => ({
    config: { bilibili: { cookies: { '1': 'fake-test-cookie' } } },
}));
vi.mock('../lib/utils/cache', () => ({
    default: { tryGet: vi.fn((_key, getValue) => getValue()) },
}));
vi.mock('../lib/utils/got', () => ({ default: vi.fn() }));
vi.mock('../lib/utils/playwright', () => ({ getPlaywrightPage: vi.fn() }));
vi.mock('../lib/utils/logger', () => ({ default: {} }));
vi.mock('../lib/routes/bilibili/utils', () => ({ default: { lsid: vi.fn() } }));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('bilibili render data', () => {
    it('extracts the access ID from the URI-encoded JSON script using the existing cache and cookie', async () => {
        const renderData = encodeURIComponent(JSON.stringify({ access_id: 'access-中文&value', other: 'ignored' }));
        vi.mocked(got).mockResolvedValue({ data: `<html><head><script id="__RENDER_DATA__" type="application/json">${renderData}</script></head></html>` });

        expect(await biliCache.getRenderData('42')).toBe('access-中文&value');
        expect(cache.tryGet).toHaveBeenCalledWith('bili-web-render-data', expect.any(Function));
        expect(got).toHaveBeenCalledExactlyOnceWith('https://space.bilibili.com/42', {
            headers: { Referer: 'https://www.bilibili.com/', Cookie: 'fake-test-cookie' },
        });
    });

    it('preserves HTML entities and markup inside script text', async () => {
        vi.mocked(got).mockResolvedValue({ data: '<script id="__RENDER_DATA__">{"access_id":"a&amp;b &#38; <span>value</span>"}</script>' });

        expect(await biliCache.getRenderData('42')).toBe('a&amp;b &#38; <span>value</span>');
    });

    it('uses the first matching element when the page contains duplicate IDs', async () => {
        vi.mocked(got).mockResolvedValue({
            data: '<script id="__RENDER_DATA__">{"access_id":"first"}</script><script id="__RENDER_DATA__">{"access_id":"second"}</script>',
        });

        expect(await biliCache.getRenderData('42')).toBe('first');
    });

    it.each(['<html><body>No render data</body></html>', '<script id="__RENDER_DATA__"></script>'])('returns undefined when render data is absent or empty: %s', async (data) => {
        vi.mocked(got).mockResolvedValue({ data });

        expect(await biliCache.getRenderData('42')).toBeUndefined();
    });

    it('continues to reject invalid JSON instead of silently returning an empty result', async () => {
        vi.mocked(got).mockResolvedValue({ data: '<script id="__RENDER_DATA__">invalid JSON</script>' });

        await expect(biliCache.getRenderData('42')).rejects.toThrow(SyntaxError);
    });
});

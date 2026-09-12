import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchThread, ThreadFetcher } from '../lib/routes/yamibo/utils';

const mocks = vi.hoisted(() => ({
    ofetch: vi.fn(),
    getPlaywrightPage: vi.fn(),
    destroy: vi.fn(),
    addCookies: vi.fn(),
    goto: vi.fn(),
    route: vi.fn(),
    waitForSelector: vi.fn(),
    content: vi.fn(),
}));
vi.mock('../lib/config', () => ({ config: { yamibo: { auth: 'test-auth', salt: 'test-salt' } } }));
vi.mock('../lib/utils/ofetch', () => ({ default: mocks.ofetch }));
vi.mock('../lib/utils/playwright', () => ({ getPlaywrightPage: mocks.getPlaywrightPage }));

beforeEach(() => {
    vi.clearAllMocks();
    mocks.goto.mockResolvedValue(undefined);
    mocks.waitForSelector.mockResolvedValue(undefined);
    mocks.ofetch.mockResolvedValue('<script type="text/javascript">/* fixture */</script>');
    mocks.content.mockResolvedValue('<div id="postlist">Thread content</div>');
    mocks.getPlaywrightPage.mockResolvedValue({
        page: { goto: mocks.goto, route: mocks.route, waitForSelector: mocks.waitForSelector, content: mocks.content },
        context: { addCookies: mocks.addCookies },
        destroy: mocks.destroy,
    });
});

describe('Yamibo browser fallback', () => {
    it('keeps ordinary HTML requests free of browser work', async () => {
        mocks.ofetch.mockResolvedValue('<div id="postlist">Ordinary HTML</div>');
        const result = await fetchThread('123', { ordertype: '1' });
        expect(result).toEqual({ link: 'https://bbs.yamibo.com/forum.php?mod=viewthread&tid=123&ordertype=1', data: '<div id="postlist">Ordinary HTML</div>' });
        expect(mocks.ofetch).toHaveBeenCalledWith(result.link, { headers: { cookie: 'EeqY_2132_saltkey=test-salt; EeqY_2132_auth=test-auth' } });
        expect(mocks.getPlaywrightPage).not.toHaveBeenCalled();
    });

    it('reuses one browser and serializes navigation for concurrent article requests', async () => {
        const fetcher = new ThreadFetcher();
        let active = 0;
        let maximum = 0;
        mocks.goto.mockImplementation(async () => {
            active++;
            maximum = Math.max(maximum, active);
            await Promise.resolve();
            active--;
        });
        try {
            const results = await Promise.all([fetcher.fetchThread('123'), fetcher.fetchThread('456')]);
            expect(results.map((result) => result.data)).toEqual(Array.from({ length: 2 }, () => '<div id="postlist">Thread content</div>'));
            expect(mocks.getPlaywrightPage).toHaveBeenCalledOnce();
            expect(mocks.goto).toHaveBeenCalledTimes(2);
            expect(maximum).toBe(1);
            expect(mocks.addCookies).toHaveBeenCalledWith([
                { name: 'EeqY_2132_saltkey', value: 'test-salt', url: 'https://bbs.yamibo.com' },
                { name: 'EeqY_2132_auth', value: 'test-auth', url: 'https://bbs.yamibo.com' },
            ]);
        } finally {
            await fetcher.close();
        }
        expect(mocks.destroy).toHaveBeenCalledOnce();
    });

    it('closes the browser when the expected thread content never appears', async () => {
        mocks.waitForSelector.mockRejectedValue(new Error('Page timeout'));
        await expect(fetchThread('123')).rejects.toThrow('browser access did not return thread content');
        expect(mocks.destroy).toHaveBeenCalledOnce();
    });
});

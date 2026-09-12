import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isWorker } from '@/utils/is-worker';

const mocks = vi.hoisted(() => ({
    cookies: '',
    ofetch: vi.fn(),
    createBrowserClient: vi.fn(),
    createJSDOMClient: vi.fn(() => {
        throw new Error('JSDOM must never run on Workers');
    }),
    get: vi.fn(),
    getPage: vi.fn(),
    close: vi.fn(),
}));

vi.mock('../lib/config', () => ({
    config: {
        zhihu: {
            get cookies() {
                return mocks.cookies;
            },
        },
    },
}));
vi.mock('../lib/utils/ofetch', () => ({ default: mocks.ofetch }));
vi.mock('../lib/routes/zhihu/browser', () => ({ createBrowserClient: mocks.createBrowserClient }));
vi.mock('../lib/routes/zhihu/jsdom', () => ({ createJSDOMClient: mocks.createJSDOMClient }));

beforeEach(() => {
    vi.resetAllMocks();
    mocks.cookies = '';
    mocks.createBrowserClient.mockResolvedValue({ get: mocks.get, getPage: mocks.getPage, close: mocks.close });
});

describe('Zhihu runtime selection in workerd', () => {
    it('uses a browser session for both API and HTML requests', async () => {
        expect(isWorker).toBe(true);
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');
        mocks.get.mockResolvedValue({ data: [1] });
        mocks.getPage.mockResolvedValue('<html>Column</html>');

        await withZhihuClient('https://zhuanlan.zhihu.com/example', async (client) => {
            expect(await client.get('/api/v4/columns/example/items')).toEqual({ data: [1] });
            expect(await client.getPage()).toBe('<html>Column</html>');
        });

        expect(mocks.createBrowserClient).toHaveBeenCalledExactlyOnceWith('https://zhuanlan.zhihu.com/example', '', '/api/v4/columns/example/items');
        expect(mocks.close).toHaveBeenCalledOnce();
        expect(mocks.createJSDOMClient).not.toHaveBeenCalled();
        expect(mocks.ofetch).not.toHaveBeenCalled();
    });

    it('uses complete configured cookies without either initializer', async () => {
        mocks.cookies = 'd_c0=configured; __zse_ck=existing';
        mocks.ofetch.mockResolvedValue({ data: [1] });
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        expect(await withZhihuClient('https://www.zhihu.com/people/example', (client) => client.get('/api/v4/members/example'))).toEqual({ data: [1] });
        expect(mocks.createBrowserClient).not.toHaveBeenCalled();
        expect(mocks.createJSDOMClient).not.toHaveBeenCalled();
        expect(mocks.ofetch).toHaveBeenCalledOnce();
    });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    cookies: '',
    ofetch: vi.fn(),
    getPlaywrightPage: vi.fn(),
    destroy: vi.fn(),
    addCookies: vi.fn(),
    browserCookies: vi.fn(),
    goto: vi.fn(),
    route: vi.fn(),
    waitForFunction: vi.fn(),
    evaluate: vi.fn(),
    content: vi.fn(),
    url: vi.fn(),
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
vi.mock('../lib/utils/is-worker', () => ({ isWorker: true }));
vi.mock('../lib/utils/playwright', () => ({ getPlaywrightPage: mocks.getPlaywrightPage }));

const origin = 'https://www.zhihu.com';
const pageUrl = `${origin}/people/example`;
const apiPath = '/api/v4/members/example/activities?limit=20';
const columnPageUrl = 'https://zhuanlan.zhihu.com/example';
const columnApiPath = '/api/v4/columns/example/items';
const feedData = { data: [{ id: 'api-item' }] };
const pageHtml = '<html><body>Profile content</body></html>';
const nativeFetch = vi.fn<typeof fetch>();
const navigationResponse = (contentType = 'text/html', status = 200, body = pageHtml) => ({
    headers: () => ({ 'content-type': contentType }),
    status: () => status,
    text: () => Promise.resolve(body),
});

beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    mocks.cookies = '';
    mocks.goto.mockImplementation((url) => {
        mocks.url.mockReturnValue(url);
        return Promise.resolve(navigationResponse());
    });
    mocks.waitForFunction.mockResolvedValue(undefined);
    mocks.browserCookies.mockResolvedValue([
        { name: 'd_c0', value: 'browser-dc0' },
        { name: '__zse_ck', value: 'browser-zse' },
    ]);
    mocks.evaluate.mockImplementation((callback, argument) => callback(argument));
    mocks.content.mockResolvedValue(pageHtml);
    mocks.url.mockReturnValue(pageUrl);
    mocks.getPlaywrightPage.mockResolvedValue({
        page: { goto: mocks.goto, route: mocks.route, waitForFunction: mocks.waitForFunction, evaluate: mocks.evaluate, content: mocks.content, url: mocks.url },
        context: { addCookies: mocks.addCookies, cookies: mocks.browserCookies },
        destroy: mocks.destroy,
    });
    nativeFetch.mockImplementation(() => Promise.resolve(Response.json(feedData)));
    vi.stubGlobal('fetch', nativeFetch);
    vi.stubGlobal('window', { AbortSignal });
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('Zhihu client session', () => {
    it('uses complete configured credentials for API and HTML requests without starting a browser', async () => {
        mocks.cookies = 'd_c0=configured==; __zse_ck=existing; z_c0=login=value';
        mocks.ofetch.mockResolvedValueOnce(feedData).mockResolvedValueOnce(pageHtml);
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        const result = await withZhihuClient(pageUrl, async (client) => ({ data: await client.get(apiPath), html: await client.getPage() }));

        expect(result).toEqual({ data: feedData, html: pageHtml });
        expect(mocks.ofetch).toHaveBeenNthCalledWith(1, `${origin}${apiPath}`, {
            headers: expect.objectContaining({ cookie: mocks.cookies, Referer: pageUrl, 'x-zse-96': expect.stringMatching(/^2\.0_/) }),
        });
        expect(mocks.ofetch).toHaveBeenNthCalledWith(2, pageUrl, {
            headers: { cookie: mocks.cookies, Referer: pageUrl },
            parseResponse: expect.any(Function),
        });
        expect(mocks.ofetch.mock.calls[1][1].parseResponse(pageHtml)).toBe(pageHtml);
        expect(mocks.getPlaywrightPage).not.toHaveBeenCalled();
        expect(nativeFetch).not.toHaveBeenCalled();
    });

    it.each(['', 'z_c0=isolated-login', 'd_c0=; z_c0=isolated-login'])('initializes a guest session before the target without transferring an unrelated login: %s', async (cookies) => {
        mocks.cookies = cookies;
        mocks.browserCookies.mockResolvedValueOnce([{ name: 'd_c0', value: 'browser-dc0' }]);
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        expect(await withZhihuClient(pageUrl, (client) => client.get(apiPath))).toEqual(feedData);

        expect(mocks.addCookies).not.toHaveBeenCalled();
        expect(mocks.goto.mock.calls).toEqual([
            [`${origin}/explore`, { waitUntil: 'domcontentloaded' }],
            [pageUrl, { waitUntil: 'domcontentloaded' }],
        ]);
        expect(mocks.browserCookies).toHaveBeenCalledTimes(3);
        expect(mocks.browserCookies).toHaveBeenCalledWith(origin);
        expect(mocks.getPlaywrightPage).toHaveBeenCalledExactlyOnceWith(pageUrl, { noGoto: true, closeTimeout: 0 });
        expect(mocks.destroy).toHaveBeenCalledOnce();
        expect(mocks.ofetch).not.toHaveBeenCalled();
    });

    it('keeps a configured identity and login intact and requests the API through the browser native fetch', async () => {
        mocks.cookies = 'd_c0=seed==;z_c0=login=value';
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        await withZhihuClient(pageUrl, (client) => client.get(apiPath));

        expect(mocks.addCookies).toHaveBeenCalledWith([
            { name: 'd_c0', value: 'seed==', domain: '.zhihu.com', path: '/' },
            { name: 'z_c0', value: 'login=value', domain: '.zhihu.com', path: '/' },
        ]);
        expect(mocks.goto).toHaveBeenCalledExactlyOnceWith(pageUrl, { waitUntil: 'domcontentloaded' });
        expect(mocks.evaluate).toHaveBeenCalledOnce();
        expect(nativeFetch).toHaveBeenCalledExactlyOnceWith(`${origin}${apiPath}`, {
            headers: expect.objectContaining({ 'x-zse-96': expect.stringMatching(/^2\.0_/) }),
            credentials: 'include',
            signal: expect.any(AbortSignal),
        });
        const headers = new Headers(nativeFetch.mock.calls[0][1]?.headers);
        expect(headers.has('cookie')).toBe(false);
        expect(headers.has('user-agent')).toBe(false);
        expect(mocks.ofetch).not.toHaveBeenCalled();
        expect(mocks.destroy).toHaveBeenCalledOnce();
        const handler = mocks.route.mock.calls[0][1];
        await Promise.all(
            ['document', 'script', 'xhr', 'fetch', 'image'].map(async (resourceType) => {
                const continueRequest = vi.fn();
                const abortRequest = vi.fn();
                await handler({ request: () => ({ resourceType: () => resourceType }), continue: continueRequest, abort: abortRequest });
                expect(continueRequest).toHaveBeenCalledTimes(resourceType === 'image' ? 0 : 1);
                expect(abortRequest).toHaveBeenCalledTimes(resourceType === 'image' ? 1 : 0);
            })
        );
    });

    it('reuses one browser for API and HTML reads and signs each API request with its current identity', async () => {
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');
        const signature = vi.spyOn(await import('../lib/routes/zhihu/sign'), 'getSignedHeaders');
        mocks.browserCookies
            .mockResolvedValueOnce([{ name: 'd_c0', value: 'guest-dc0' }])
            .mockResolvedValueOnce([
                { name: 'd_c0', value: 'guest-dc0' },
                { name: '__zse_ck', value: 'browser-zse' },
            ])
            .mockResolvedValueOnce([{ name: 'd_c0', value: 'first-dc0' }])
            .mockResolvedValueOnce([{ name: 'd_c0', value: 'updated-dc0' }]);

        const html = await withZhihuClient(pageUrl, async (client) => {
            expect(await client.get(apiPath)).toEqual(feedData);
            expect(await client.get('/api/v4/members/example')).toEqual(feedData);
            expect(mocks.destroy).not.toHaveBeenCalled();
            return client.getPage();
        });

        expect(html).toBe(pageHtml);
        expect(signature).toHaveBeenNthCalledWith(1, apiPath, 'first-dc0');
        expect(signature).toHaveBeenNthCalledWith(2, '/api/v4/members/example', 'updated-dc0');
        expect(mocks.getPlaywrightPage).toHaveBeenCalledOnce();
        expect(mocks.goto).toHaveBeenLastCalledWith(pageUrl, { waitUntil: 'domcontentloaded' });
        expect(mocks.content).toHaveBeenCalledOnce();
        expect(nativeFetch).toHaveBeenCalledTimes(2);
        expect(mocks.ofetch).not.toHaveBeenCalled();
        expect(mocks.destroy).toHaveBeenCalledOnce();
    });

    it('requests the signed API after an initial JSON error without waiting for an unnecessary session cookie', async () => {
        mocks.browserCookies.mockResolvedValue([{ name: 'd_c0', value: 'browser-dc0' }]);
        mocks.goto.mockImplementation((url) => {
            mocks.url.mockReturnValue(url);
            return Promise.resolve(url === `${origin}${columnApiPath}` ? navigationResponse('application/json; charset=utf-8', 403, '{"error":{"code":403}}') : navigationResponse());
        });
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        expect(await withZhihuClient(columnPageUrl, (client) => client.get(columnApiPath))).toEqual(feedData);

        expect(mocks.goto.mock.calls).toEqual([
            [`${origin}/explore`, { waitUntil: 'domcontentloaded' }],
            [`${origin}${columnApiPath}`, { waitUntil: 'domcontentloaded' }],
        ]);
        expect(mocks.waitForFunction).not.toHaveBeenCalled();
        expect(mocks.browserCookies).toHaveBeenCalledTimes(3);
        expect(mocks.evaluate).toHaveBeenCalledOnce();
        expect(nativeFetch).toHaveBeenCalledExactlyOnceWith(`${origin}${columnApiPath}`, expect.objectContaining({ credentials: 'include' }));
        expect(mocks.ofetch).not.toHaveBeenCalled();
        expect(mocks.destroy).toHaveBeenCalledOnce();
    });

    it('consumes a successful initial JSON response once without requesting the first API twice', async () => {
        mocks.browserCookies.mockResolvedValue([{ name: 'd_c0', value: 'browser-dc0' }]);
        mocks.goto.mockImplementation((url) => {
            mocks.url.mockReturnValue(url);
            return Promise.resolve(url === `${origin}${columnApiPath}` ? navigationResponse('application/json', 200, JSON.stringify(feedData)) : navigationResponse());
        });
        const refreshedData = { data: [{ id: 'refreshed-item' }] };
        nativeFetch.mockResolvedValue(Response.json(refreshedData));
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        await withZhihuClient(columnPageUrl, async (client) => {
            expect(await client.get(columnApiPath)).toEqual(feedData);
            expect(nativeFetch).not.toHaveBeenCalled();
            expect(mocks.evaluate).not.toHaveBeenCalled();
            expect(await client.get(columnApiPath)).toEqual(refreshedData);
        });

        expect(mocks.goto).toHaveBeenCalledTimes(2);
        expect(mocks.waitForFunction).not.toHaveBeenCalled();
        expect(nativeFetch).toHaveBeenCalledOnce();
        expect(mocks.evaluate).toHaveBeenCalledOnce();
        expect(mocks.ofetch).not.toHaveBeenCalled();
        expect(mocks.destroy).toHaveBeenCalledOnce();
    });

    it('initializes a column on the API origin and restores that origin after reading the column HTML', async () => {
        const columnUrl = 'https://zhuanlan.zhihu.com/example';
        const columnApi = '/api/v4/columns/example/items';
        mocks.url.mockReturnValue(columnUrl);
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        await withZhihuClient(columnUrl, async (client) => {
            expect(await client.get(columnApi)).toEqual(feedData);
            expect(await client.getPage()).toBe(pageHtml);
            expect(await client.get(columnApi)).toEqual(feedData);
        });

        expect(mocks.goto.mock.calls).toEqual([
            [`${origin}/explore`, { waitUntil: 'domcontentloaded' }],
            [`${origin}${columnApi}`, { waitUntil: 'domcontentloaded' }],
            [columnUrl, { waitUntil: 'domcontentloaded' }],
            [`${origin}/explore`, { waitUntil: 'domcontentloaded' }],
        ]);
        expect(mocks.getPlaywrightPage).toHaveBeenCalledExactlyOnceWith(columnUrl, { noGoto: true, closeTimeout: 0 });
        expect(nativeFetch).toHaveBeenCalledTimes(2);
        expect(nativeFetch).toHaveBeenCalledWith(`${origin}${columnApi}`, expect.objectContaining({ credentials: 'include' }));
        expect(mocks.ofetch).not.toHaveBeenCalled();
        expect(mocks.destroy).toHaveBeenCalledOnce();
    });

    it('initializes a c_-style column through its API even when the page already uses the API origin', async () => {
        const columnUrl = `${origin}/column/c_123`;
        const columnApi = '/api/v4/columns/c_123/items';
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        expect(await withZhihuClient(columnUrl, (client) => client.get(columnApi))).toEqual(feedData);

        expect(mocks.goto.mock.calls).toEqual([
            [`${origin}/explore`, { waitUntil: 'domcontentloaded' }],
            [`${origin}${columnApi}`, { waitUntil: 'domcontentloaded' }],
        ]);
        expect(mocks.getPlaywrightPage).toHaveBeenCalledExactlyOnceWith(columnUrl, { noGoto: true, closeTimeout: 0 });
        expect(nativeFetch).toHaveBeenCalledExactlyOnceWith(`${origin}${columnApi}`, expect.objectContaining({ credentials: 'include' }));
        expect(mocks.destroy).toHaveBeenCalledOnce();
    });

    it.each([
        [`${origin}/people/example`, '/api/v3/moments/example/activities?limit=5'],
        [`${origin}/topic/123/newest`, '/api/v5.1/topics/123/feeds/timeline_activity'],
        [`${origin}/question/123`, '/api/v4/questions/123/answers?limit=20'],
    ])('initializes the human page for a non-column API: %s', async (targetUrl, targetApi) => {
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        expect(await withZhihuClient(targetUrl, (client) => client.get(targetApi))).toEqual(feedData);

        expect(mocks.goto.mock.calls).toEqual([
            [`${origin}/explore`, { waitUntil: 'domcontentloaded' }],
            [targetUrl, { waitUntil: 'domcontentloaded' }],
        ]);
        expect(nativeFetch).toHaveBeenCalledExactlyOnceWith(`${origin}${targetApi}`, expect.objectContaining({ credentials: 'include' }));
        expect(mocks.destroy).toHaveBeenCalledOnce();
    });

    it('does not initialize a browser when the callback performs no requests', async () => {
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        expect(await withZhihuClient(pageUrl, () => Promise.resolve('cached result'))).toBe('cached result');

        expect(mocks.getPlaywrightPage).not.toHaveBeenCalled();
        expect(mocks.ofetch).not.toHaveBeenCalled();
        expect(nativeFetch).not.toHaveBeenCalled();
    });

    it('closes the browser when the route callback fails after reading data', async () => {
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        await expect(
            withZhihuClient(pageUrl, async (client) => {
                await client.get(apiPath);
                throw new Error('Route parsing failed');
            })
        ).rejects.toThrow('Route parsing failed');

        expect(mocks.destroy).toHaveBeenCalledOnce();
    });

    it.each([
        { status: 403, body: 'test-private-response', error: 'HTTP 403' },
        { status: 200, body: '<html>test-private-response</html>', error: 'did not return JSON' },
    ])('rejects an unusable API response and closes the browser: $error', async ({ status, body, error }) => {
        nativeFetch.mockResolvedValue(new Response(body, { status }));
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        const result = withZhihuClient(pageUrl, (client) => client.get(apiPath));

        await expect(result).rejects.toThrow(error);
        await expect(result).rejects.not.toThrow('test-private-response');
        expect(mocks.destroy).toHaveBeenCalledOnce();
        expect(mocks.ofetch).not.toHaveBeenCalled();
    });

    it('closes the browser when its native API fetch fails', async () => {
        nativeFetch.mockRejectedValue(new Error('Browser fetch failed'));
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        await expect(withZhihuClient(pageUrl, (client) => client.get(apiPath))).rejects.toThrow('Browser fetch failed');

        expect(mocks.destroy).toHaveBeenCalledOnce();
        expect(mocks.ofetch).not.toHaveBeenCalled();
    });

    it('closes the browser and gives an actionable phase when session cookies are unavailable', async () => {
        mocks.waitForFunction.mockRejectedValue(new Error('Page timeout'));
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        const result = withZhihuClient(pageUrl, (client) => client.get(apiPath));

        await expect(result).rejects.toThrow('session cookie wait');
        await expect(result).rejects.toThrow('Configure ZHIHU_COOKIES');
        expect(nativeFetch).not.toHaveBeenCalled();
        expect(mocks.destroy).toHaveBeenCalledOnce();
    });

    it('stops before the target and closes the browser when guest navigation fails', async () => {
        mocks.goto.mockRejectedValueOnce(new Error('Navigation failed with test-private-diagnostic'));
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        const result = withZhihuClient(pageUrl, (client) => client.get(apiPath));

        await expect(result).rejects.toThrow('guest cookie initialization');
        await expect(result).rejects.toThrow('Configure ZHIHU_COOKIES');
        await expect(result).rejects.not.toThrow('test-private-diagnostic');
        expect(mocks.goto).toHaveBeenCalledExactlyOnceWith(`${origin}/explore`, { waitUntil: 'domcontentloaded' });
        expect(mocks.browserCookies).not.toHaveBeenCalled();
        expect(mocks.waitForFunction).not.toHaveBeenCalled();
        expect(mocks.destroy).toHaveBeenCalledOnce();
    });

    it('stops before the target and closes the browser when the guest page does not set d_c0', async () => {
        mocks.browserCookies.mockResolvedValueOnce([{ name: '__zse_ck', value: 'browser-zse' }]);
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        await expect(withZhihuClient(pageUrl, (client) => client.get(apiPath))).rejects.toThrow('guest cookie initialization');

        expect(mocks.goto).toHaveBeenCalledExactlyOnceWith(`${origin}/explore`, { waitUntil: 'domcontentloaded' });
        expect(mocks.browserCookies).toHaveBeenCalledExactlyOnceWith(origin);
        expect(mocks.waitForFunction).not.toHaveBeenCalled();
        expect(mocks.evaluate).not.toHaveBeenCalled();
        expect(mocks.destroy).toHaveBeenCalledOnce();
    });

    it('rejects non-API paths before initializing a session', async () => {
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        await expect(withZhihuClient(pageUrl, (client) => client.get('//example.invalid/api/'))).rejects.toThrow('expected an API path');

        expect(mocks.getPlaywrightPage).not.toHaveBeenCalled();
        expect(nativeFetch).not.toHaveBeenCalled();
        expect(mocks.ofetch).not.toHaveBeenCalled();
    });
});

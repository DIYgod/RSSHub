import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    cookies: '',
    ofetch: vi.fn(),
    raw: vi.fn(),
    tryGet: vi.fn(),
    generateHeaders: vi.fn(),
    createBrowserClient: vi.fn(),
}));

vi.mock('../lib/config', () => ({
    config: {
        zhihu: {
            get cookies() {
                return mocks.cookies;
            },
        },
        cache: { contentExpire: 3600 },
    },
}));
vi.mock('../lib/utils/ofetch', () => ({ default: Object.assign(mocks.ofetch, { raw: mocks.raw }) }));
vi.mock('../lib/utils/cache', () => ({ default: { tryGet: mocks.tryGet } }));
vi.mock('../lib/utils/header-generator', () => ({ generateHeaders: mocks.generateHeaders }));
vi.mock('../lib/utils/is-worker', () => ({ isWorker: false }));
vi.mock('../lib/routes/zhihu/browser', () => ({ createBrowserClient: mocks.createBrowserClient }));

const origin = 'https://www.zhihu.com';
const pageUrl = `${origin}/people/example`;
const apiPath = '/api/v4/members/example/activities?limit=20';
const otherApiPath = '/api/v4/members/example?include=description';
const scriptUrl = 'https://static.zhihu.com/zse-ck/v4/0123456789abcdef.js';
const challengeHtml = '<meta id="zh-zse-ck" content="challenge-fixture"><script src="https://static.zhihu.com/zse-ck/v4/0123456789abcdef.js"></script>';
const challengeScript = `
if (navigator.userAgent !== 'RSSHub JSDOM fixture' || navigator.webdriver !== false) {
    throw new Error('The challenge did not receive the configured browser fingerprint');
}
if (document.getElementById('zh-zse-ck').getAttribute('content') !== 'challenge-fixture') {
    throw new Error('The challenge did not receive its page metadata');
}
document.cookie = '__zse_ck=generated-token; path=/';
`;
const userAgent = 'RSSHub JSDOM fixture';
const feedData = { data: [{ id: 'api-item' }] };
const pageHtml = '<html><body>Profile content</body></html>';
const cached = new Map<string, unknown>();
let initialRejectionListeners: Set<ReturnType<typeof process.listeners>[number]>;

const requestHeaders = (url: string) => {
    const request = mocks.ofetch.mock.calls.find(([requestedUrl]) => requestedUrl === url);
    expect(request).toBeDefined();
    return new Headers(request?.[1]?.headers);
};

beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    cached.clear();
    mocks.cookies = '';
    initialRejectionListeners = new Set(process.listeners('unhandledRejection'));
    vi.spyOn(Math, 'random').mockReturnValue(0.25);
    mocks.generateHeaders.mockReturnValue({ 'user-agent': userAgent });
    mocks.tryGet.mockImplementation(async (key: string, fetchValue: () => Promise<unknown>) => {
        if (!cached.has(key)) {
            cached.set(key, await fetchValue());
        }
        return cached.get(key);
    });
    mocks.raw.mockImplementation((url: string) => Promise.resolve(url === `${origin}/explore` ? { headers: new Headers({ 'set-cookie': 'd_c0=guest-identity==|fixture; Path=/; Secure' }) } : { _data: challengeHtml }));
    mocks.ofetch.mockImplementation((url: string) => {
        if (url === scriptUrl) {
            return Promise.resolve(challengeScript);
        }
        if (url === pageUrl) {
            return Promise.resolve(pageHtml);
        }
        if (url.startsWith(`${origin}/api/`)) {
            return Promise.resolve(feedData);
        }
        throw new Error(`Unexpected fixture URL: ${url}`);
    });
});

afterEach(() => {
    for (const listener of process.listeners('unhandledRejection')) {
        if (!initialRejectionListeners.has(listener)) {
            process.removeListener('unhandledRejection', listener);
        }
    }
    expect(mocks.createBrowserClient).not.toHaveBeenCalled();
    vi.restoreAllMocks();
});

describe('Zhihu JSDOM client on Node', () => {
    it.each(['', 'z_c0=isolated-login', 'd_c0=; z_c0=isolated-login'])('executes the challenge in JSDOM and keeps guest credentials isolated: %s', async (cookies) => {
        mocks.cookies = cookies;
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        expect(await withZhihuClient(pageUrl, (client) => client.get(apiPath))).toEqual(feedData);

        expect(mocks.raw).toHaveBeenNthCalledWith(1, `${origin}/explore`, {
            headers: { 'user-agent': userAgent },
            redirect: 'manual',
            ignoreResponseError: true,
        });
        expect(mocks.raw).toHaveBeenNthCalledWith(2, `${origin}${apiPath}`, {
            headers: {
                'user-agent': userAgent,
                cookie: 'd_c0=guest-identity; __zse_ck=005_x-x',
                referer: pageUrl,
                'x-requested-with': 'fetch',
            },
            ignoreResponseError: true,
        });
        expect(requestHeaders(`${origin}${apiPath}`).get('cookie')).toBe('__zse_ck=generated-token; d_c0=guest-identity');
        expect(requestHeaders(`${origin}${apiPath}`).get('user-agent')).toBe(userAgent);
        expect(mocks.ofetch).toHaveBeenCalledWith(scriptUrl, { headers: { 'user-agent': userAgent }, parseResponse: expect.any(Function) });
        expect(mocks.tryGet).toHaveBeenCalledWith('zhihu:zse-ck:v4:guest', expect.any(Function), 3600, false);
    });

    it('preserves the configured identity and login cookies without creating a guest session', async () => {
        mocks.cookies = 'd_c0=configured==; z_c0=login=value; __zse_ck=; extra=retained';
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        await withZhihuClient(pageUrl, (client) => client.get(apiPath));

        expect(mocks.raw).toHaveBeenCalledExactlyOnceWith(`${origin}${apiPath}`, expect.objectContaining({ headers: expect.objectContaining({ cookie: 'd_c0=configured==; __zse_ck=005_x-x' }) }));
        expect(requestHeaders(`${origin}${apiPath}`).get('cookie')).toBe('__zse_ck=generated-token; d_c0=configured==; z_c0=login=value; extra=retained');
        expect(requestHeaders(`${origin}${apiPath}`).get('user-agent')).toBe(userAgent);
    });

    it('keeps API and HTML requests in the same generated identity and signs each API path separately', async () => {
        mocks.cookies = 'd_c0=configured==; z_c0=login';
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');
        const { getSignedHeaders } = await import('../lib/routes/zhihu/sign');

        const result = await withZhihuClient(pageUrl, async (client) => ({
            first: await client.get(apiPath),
            second: await client.get(otherApiPath),
            html: await client.getPage(),
        }));

        expect(result).toEqual({ first: feedData, second: feedData, html: pageHtml });
        expect(mocks.raw).toHaveBeenCalledTimes(1);
        expect(mocks.generateHeaders).toHaveBeenCalledTimes(1);
        for (const url of [`${origin}${apiPath}`, `${origin}${otherApiPath}`, pageUrl]) {
            const headers = requestHeaders(url);
            expect(headers.get('cookie')).toBe('__zse_ck=generated-token; d_c0=configured==; z_c0=login');
            expect(headers.get('user-agent')).toBe(userAgent);
            expect(headers.get('referer')).toBe(pageUrl);
        }
        expect(requestHeaders(`${origin}${apiPath}`).get('x-zse-96')).toBe(getSignedHeaders(apiPath, 'configured==')['x-zse-96']);
        expect(requestHeaders(`${origin}${otherApiPath}`).get('x-zse-96')).toBe(getSignedHeaders(otherApiPath, 'configured==')['x-zse-96']);
        expect(requestHeaders(`${origin}${apiPath}`).get('x-zse-96')).not.toBe(requestHeaders(`${origin}${otherApiPath}`).get('x-zse-96'));
        const htmlRequest = mocks.ofetch.mock.calls.find(([url]) => url === pageUrl);
        expect(htmlRequest?.[1]?.parseResponse(pageHtml)).toBe(pageHtml);
    });

    it('initializes from the page path when HTML is requested before an API', async () => {
        mocks.cookies = 'd_c0=configured==';
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        await withZhihuClient(pageUrl, async (client) => {
            expect(await client.getPage()).toBe(pageHtml);
            expect(await client.get(apiPath)).toEqual(feedData);
        });

        expect(mocks.raw).toHaveBeenCalledExactlyOnceWith(pageUrl, expect.objectContaining({ ignoreResponseError: true }));
        expect(requestHeaders(pageUrl).get('cookie')).toBe(requestHeaders(`${origin}${apiPath}`).get('cookie'));
        expect(requestHeaders(pageUrl).get('user-agent')).toBe(userAgent);
    });

    it('deduplicates concurrent challenge generation and reuses cached credentials across clients', async () => {
        mocks.cookies = 'd_c0=configured==';
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        const results = await Promise.all([withZhihuClient(pageUrl, (client) => client.get(apiPath)), withZhihuClient(pageUrl, (client) => client.get(otherApiPath))]);
        expect(results).toEqual([feedData, feedData]);
        await withZhihuClient(pageUrl, (client) => client.get(apiPath));

        expect(mocks.raw).toHaveBeenCalledTimes(1);
        expect(mocks.generateHeaders).toHaveBeenCalledTimes(1);
        expect(mocks.ofetch.mock.calls.filter(([url]) => url === scriptUrl)).toHaveLength(1);
    });

    it('retries generation after a failed challenge without permanently caching the rejection', async () => {
        mocks.cookies = 'd_c0=configured==';
        mocks.raw.mockResolvedValueOnce({ _data: '<html>No challenge script</html>' });
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        await withZhihuClient(pageUrl, async (client) => {
            await expect(client.get(apiPath)).rejects.toThrow('challenge page');
            expect(await client.get(apiPath)).toEqual(feedData);
        });

        expect(mocks.raw).toHaveBeenCalledTimes(2);
        expect(mocks.tryGet).toHaveBeenCalledTimes(2);
        expect(mocks.ofetch.mock.calls.filter(([url]) => url === `${origin}${apiPath}`)).toHaveLength(1);
    });

    it('does not reuse generated credentials for a different configured identity', async () => {
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');
        mocks.cookies = 'd_c0=first-identity; z_c0=first-login';
        await withZhihuClient(pageUrl, (client) => client.get(apiPath));
        mocks.cookies = 'd_c0=second-identity; z_c0=second-login';
        await withZhihuClient(pageUrl, (client) => client.get(otherApiPath));

        expect(mocks.raw).toHaveBeenCalledTimes(2);
        expect(mocks.tryGet.mock.calls[0][0]).not.toBe(mocks.tryGet.mock.calls[1][0]);
        expect(requestHeaders(`${origin}${apiPath}`).get('cookie')).toBe('__zse_ck=generated-token; d_c0=first-identity; z_c0=first-login');
        expect(requestHeaders(`${origin}${otherApiPath}`).get('cookie')).toBe('__zse_ck=generated-token; d_c0=second-identity; z_c0=second-login');
    });

    it('uses complete configured credentials without initializing JSDOM or a browser', async () => {
        mocks.cookies = 'd_c0=configured==; __zse_ck=existing-token; z_c0=login=value';
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        expect(await withZhihuClient(pageUrl, async (client) => ({ data: await client.get(apiPath), html: await client.getPage() }))).toEqual({ data: feedData, html: pageHtml });

        expect(requestHeaders(`${origin}${apiPath}`).get('cookie')).toBe(mocks.cookies);
        expect(requestHeaders(pageUrl).get('cookie')).toBe(mocks.cookies);
        expect(mocks.raw).not.toHaveBeenCalled();
        expect(mocks.tryGet).not.toHaveBeenCalled();
        expect(mocks.generateHeaders).not.toHaveBeenCalled();
    });

    it.each(['', 'd_c0=configured==; __zse_ck=existing-token'])('rejects non-API URLs before any I/O: %s', async (cookies) => {
        mocks.cookies = cookies;
        const { withZhihuClient } = await import('../lib/routes/zhihu/utils');

        await withZhihuClient(pageUrl, async (client) => {
            await expect(client.get('https://example.com/api/v4/members/example')).rejects.toThrow('expected an API path');
            await expect(client.get('/people/example')).rejects.toThrow('expected an API path');
        });

        expect(mocks.ofetch).not.toHaveBeenCalled();
        expect(mocks.raw).not.toHaveBeenCalled();
        expect(mocks.tryGet).not.toHaveBeenCalled();
        expect(mocks.generateHeaders).not.toHaveBeenCalled();
    });
});

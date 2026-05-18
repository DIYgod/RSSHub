import { describe, expect, it, vi } from 'vitest';

const connect = vi.fn();
const connectOverCDP = vi.fn();
const launch = vi.fn();

const routeContinue = vi.fn();
const routeAbort = vi.fn();
const route = {
    request: vi.fn(),
    continue: routeContinue,
    abort: routeAbort,
};

const request = {
    resourceType: vi.fn(),
    url: vi.fn(),
};

let page: any;
let context: any;
let browser: any;

const createBrowserMocks = () => {
    page = {
        context: vi.fn(),
        goto: vi.fn(),
        on: vi.fn(),
        route: vi.fn(),
        setExtraHTTPHeaders: vi.fn(),
        unroute: vi.fn(),
    };

    context = {
        addCookies: vi.fn(),
        close: vi.fn(() => Promise.resolve()),
        cookies: vi.fn(),
        newPage: vi.fn(() => Promise.resolve(page)),
    };

    browser = {
        close: vi.fn(),
        newContext: vi.fn(() => Promise.resolve(context)),
    };
};

const proxyMock = {
    proxyObj: { url_regex: '.*' },
    proxyUrlHandler: new URL('http://proxy.local'),
    multiProxy: undefined as any,
    getCurrentProxy: vi.fn(),
    markProxyFailed: vi.fn(),
    getDispatcherForProxy: vi.fn(),
};

vi.mock('playwright', () => ({
    chromium: {
        connect,
        connectOverCDP,
        launch,
    },
}));

vi.mock('@/utils/proxy', () => ({
    default: proxyMock,
}));

vi.mock('@/utils/logger', () => ({
    default: {
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

const loadPlaywright = async () => {
    vi.resetModules();
    const mod = await import('@/utils/playwright');
    return mod.getPlaywrightPage;
};

const resetMocks = () => {
    createBrowserMocks();
    connect.mockReset();
    connectOverCDP.mockReset();
    launch.mockReset();
    routeContinue.mockReset();
    routeAbort.mockReset();
    route.request.mockReset();
    request.resourceType.mockReset();
    request.url.mockReset();
    proxyMock.multiProxy = undefined;
    proxyMock.getCurrentProxy.mockReset();
    proxyMock.markProxyFailed.mockReset();
    delete process.env.PLAYWRIGHT_WS_ENDPOINT;
    delete process.env.PUPPETEER_WS_ENDPOINT;
};

createBrowserMocks();

describe('getPlaywrightPage (mocked)', () => {
    it('connects via ws endpoint and runs onBeforeLoad', async () => {
        resetMocks();
        connect.mockResolvedValue(browser);
        connectOverCDP.mockResolvedValue(browser);
        launch.mockResolvedValue(browser);
        page.goto.mockResolvedValue(undefined);
        browser.close.mockResolvedValue(undefined);
        process.env.PLAYWRIGHT_WS_ENDPOINT = 'ws://localhost:3000/?token=abc';
        proxyMock.getCurrentProxy.mockReturnValue(null);

        const getPlaywrightPage = await loadPlaywright();
        const onBeforeLoad = vi.fn();
        const close = browser.close;
        const result = await getPlaywrightPage('https://example.com', {
            noGoto: true,
            onBeforeLoad,
        });

        const endpoint = connect.mock.calls[0][0] as string;
        expect(connectOverCDP).not.toHaveBeenCalled();
        expect(endpoint).toContain('launch-options=');
        expect(endpoint).not.toContain('launch=');
        const launchOptions = JSON.parse(new URL(endpoint).searchParams.get('launch-options') || '{}');
        expect(launchOptions.args).not.toContainEqual(expect.stringContaining('--user-agent='));
        expect(onBeforeLoad).toHaveBeenCalled();

        await result.destroy();
        expect(close).toHaveBeenCalled();
    });

    it('does not override the browser user agent', async () => {
        resetMocks();
        launch.mockResolvedValue(browser);
        page.goto.mockResolvedValue(undefined);
        proxyMock.getCurrentProxy.mockReturnValue(null);

        const getPlaywrightPage = await loadPlaywright();
        await getPlaywrightPage('https://example.com');

        expect(launch).toHaveBeenCalledWith(
            expect.objectContaining({
                args: expect.not.arrayContaining([expect.stringContaining('--user-agent=')]),
            })
        );
        expect(browser.newContext).toHaveBeenCalledWith(
            expect.not.objectContaining({
                userAgent: expect.any(String),
            })
        );
    });

    it('supports extending the browser auto close timeout', async () => {
        vi.useFakeTimers();
        try {
            resetMocks();
            launch.mockResolvedValue(browser);
            browser.close.mockResolvedValue(undefined);
            page.goto.mockResolvedValue(undefined);
            proxyMock.getCurrentProxy.mockReturnValue(null);

            const getPlaywrightPage = await loadPlaywright();
            const close = browser.close;
            await getPlaywrightPage('https://example.com', {
                closeTimeout: 90000,
                noGoto: true,
            });

            await vi.advanceTimersByTimeAsync(89999);
            expect(close).not.toHaveBeenCalled();

            await vi.advanceTimersByTimeAsync(1);
            expect(close).toHaveBeenCalled();
        } finally {
            vi.useRealTimers();
        }
    });

    it('handles requestfinished events after the remote page closes', async () => {
        resetMocks();
        launch.mockResolvedValue(browser);
        page.goto.mockResolvedValue(undefined);
        proxyMock.getCurrentProxy.mockReturnValue(null);

        const getPlaywrightPage = await loadPlaywright();
        const handler = vi.fn();
        const rawOn = page.on;
        await getPlaywrightPage('https://example.com', {
            onBeforeLoad: (page) => {
                page.on('requestfinished', handler);
            },
        });

        const finishedHandler = rawOn.mock.calls.find(([event]) => event === 'requestfinished')?.[1];
        await finishedHandler?.({
            response: vi.fn().mockRejectedValue(new Error('closed')),
            url: () => 'https://example.com/api',
        });

        expect(handler).toHaveBeenCalledTimes(1);
        const finishedRequest = handler.mock.calls[0][0];
        expect(finishedRequest.response()).toBeNull();
        expect(finishedRequest.url()).toBe('https://example.com/api');
    });

    it('marks proxy failed when navigation throws with multi-proxy', async () => {
        resetMocks();
        launch.mockResolvedValue(browser);
        page.goto.mockRejectedValueOnce(new Error('fail'));

        const currentProxy = {
            uri: 'http://user:pass@proxy.local:8080',
            urlHandler: new URL('http://user:pass@proxy.local:8080'),
        };
        proxyMock.multiProxy = {};
        proxyMock.getCurrentProxy.mockReturnValue(currentProxy);

        const getPlaywrightPage = await loadPlaywright();
        await expect(getPlaywrightPage('https://example.com')).rejects.toThrow('fail');

        expect(proxyMock.markProxyFailed).toHaveBeenCalledWith(currentProxy.uri);
    });

    it('maps legacy networkidle waits to playwright networkidle', async () => {
        resetMocks();
        launch.mockResolvedValue(browser);
        page.goto.mockResolvedValue(undefined);
        proxyMock.getCurrentProxy.mockReturnValue(null);

        const getPlaywrightPage = await loadPlaywright();
        const goto = page.goto;
        await getPlaywrightPage('https://example.com', {
            gotoConfig: {
                waitUntil: 'networkidle2',
            },
        });

        expect(goto).toHaveBeenCalledWith('https://example.com', {
            waitUntil: 'networkidle',
        });
    });

    it('keeps legacy request interception helpers', async () => {
        resetMocks();
        launch.mockResolvedValue(browser);
        page.goto.mockResolvedValue(undefined);
        proxyMock.getCurrentProxy.mockReturnValue(null);
        request.resourceType.mockReturnValue('image');
        request.url.mockReturnValue('https://example.com/logo.png');
        routeAbort.mockReturnValueOnce(new Promise((resolve) => setTimeout(resolve, 0)));
        route.request.mockReturnValue(request);

        const getPlaywrightPage = await loadPlaywright();
        await getPlaywrightPage('https://example.com', {
            onBeforeLoad: async (page) => {
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' ? request.continue() : request.abort();
                });
            },
        });

        const routeHandler = page.route.mock.calls[0][1];
        await routeHandler(route);

        expect(routeAbort).toHaveBeenCalled();
        expect(routeContinue).not.toHaveBeenCalled();
    });
});

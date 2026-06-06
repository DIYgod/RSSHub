import { describe, expect, it, vi } from 'vitest';

const connect = vi.fn();
const connectOverCDP = vi.fn();
const launch = vi.fn();

let page: any;
let context: any;
let browser: any;

const createBrowserMocks = () => {
    page = {
        context: vi.fn(),
        goto: vi.fn(),
        on: vi.fn(),
        setExtraHTTPHeaders: vi.fn(),
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

vi.mock('patchright', () => ({
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
        const contextClose = context.close;
        const result = await getPlaywrightPage('https://example.com', {
            noGoto: true,
            onBeforeLoad,
        });

        const endpoint = connect.mock.calls[0][0] as string;
        expect(connectOverCDP).not.toHaveBeenCalled();
        expect(endpoint).toContain('launch=');
        expect(endpoint).not.toContain('launch-options=');
        const launchOptions = JSON.parse(new URL(endpoint).searchParams.get('launch') || '{}');
        expect(launchOptions.args).not.toContainEqual(expect.stringContaining('--user-agent='));
        expect(launchOptions.executablePath).toBeUndefined();
        expect(launchOptions.acceptInsecureCerts).toBe(true);
        expect(onBeforeLoad).toHaveBeenCalled();

        await result.destroy();
        expect(contextClose).toHaveBeenCalled();
    });

    it('merges browserless launch options with existing ws endpoint launch param', async () => {
        resetMocks();
        connect.mockResolvedValue(browser);
        launch.mockResolvedValue(browser);
        page.goto.mockResolvedValue(undefined);
        browser.close.mockResolvedValue(undefined);
        process.env.PLAYWRIGHT_WS_ENDPOINT = `ws://localhost:3000/?token=abc&launch=${encodeURIComponent(JSON.stringify({ stealth: true }))}`;
        proxyMock.getCurrentProxy.mockReturnValue(null);

        const getPlaywrightPage = await loadPlaywright();
        const result = await getPlaywrightPage('https://example.com', { noGoto: true });

        const endpoint = connect.mock.calls[0][0] as string;
        const launchOptions = JSON.parse(new URL(endpoint).searchParams.get('launch') || '{}');
        expect(launchOptions.stealth).toBe(true);
        expect(launchOptions.headless).toBe(true);

        await result.destroy();
    });

    it('does override the default HeadlessChrome user agent', async () => {
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
            expect.objectContaining({
                userAgent: expect.any(String),
            })
        );
        const contextOptions = browser.newContext.mock.calls[0][0];
        expect(contextOptions.userAgent).not.toMatch(/HeadlessChrome/i);
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
});

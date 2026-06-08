import type { BrowserContext } from 'patchright';
import { afterEach, describe, expect, it, vi } from 'vitest';

import wait from './wait';

const connect = vi.fn();
const connectOverCDP = vi.fn();
const launch = vi.fn();

let mockPage: any;
let mockContext: any;
let mockBrowser: any;

const createBrowserMocks = () => {
    mockPage = {
        context: vi.fn(),
        goto: vi.fn(),
        on: vi.fn(),
        setExtraHTTPHeaders: vi.fn(),
    };

    mockContext = {
        addCookies: vi.fn(),
        close: vi.fn(() => Promise.resolve()),
        cookies: vi.fn(),
        newPage: vi.fn(() => Promise.resolve(mockPage)),
    };

    mockBrowser = {
        close: vi.fn(),
        newContext: vi.fn(() => Promise.resolve(mockContext)),
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

createBrowserMocks();

const loadPlaywright = async () => {
    vi.resetModules();
    vi.doMock('dotenv/config', () => ({}));
    vi.doMock('patchright', () => ({
        chromium: {
            connect,
            connectOverCDP,
            launch,
        },
    }));
    vi.doMock('@/utils/proxy', () => ({
        default: proxyMock,
    }));
    vi.doMock('@/utils/logger', () => ({
        default: {
            warn: vi.fn(),
            debug: vi.fn(),
        },
    }));
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
    delete process.env.PLAYWRIGHT_CDP_ENDPOINT;
};

let context: BrowserContext | null = null;

afterEach(async () => {
    if (context) {
        await context.close();
        context = null;
    }

    delete process.env.PROXY_URI;
    delete process.env.PROXY_PROTOCOL;
    delete process.env.PROXY_HOST;
    delete process.env.PROXY_PORT;
    delete process.env.PROXY_AUTH;
    delete process.env.PROXY_URL_REGEX;

    vi.doUnmock('dotenv/config');
    vi.doUnmock('patchright');
    vi.doUnmock('@/utils/proxy');
    vi.doUnmock('@/utils/logger');

    vi.resetModules();
});

describe('playwright', () => {
    it('playwright run', async () => {
        const { default: playwright } = await import('./playwright');
        context = await playwright();
        const browser = context.browser();
        const page = await context.newPage();
        await page.goto('https://www.google.com', {
            waitUntil: 'domcontentloaded',
        });

        const html = await page.evaluate(() => document.body.innerHTML);
        expect(html.length).toBeGreaterThan(0);

        expect(browser?.isConnected()).toBe(true);
        await browser?.close();
        expect(browser?.isConnected()).toBe(false);
    }, 10000);

    it('getPlaywrightPage', async () => {
        const { getPlaywrightPage } = await import('./playwright');
        const playwright = await getPlaywrightPage('https://www.google.com');
        const page = playwright.page;
        context = playwright.context;
        const browser = context.browser();
        const startTime = Date.now();

        const html = await page.evaluate(() => document.body.innerHTML);
        expect(html.length).toBeGreaterThan(0);

        expect(browser?.isConnected()).toBe(true);
        const sleepTime = 31 * 1000 - (Date.now() - startTime);
        if (sleepTime > 0) {
            await wait(sleepTime);
        }
        expect(browser?.isConnected()).toBe(false);
        context = null;
    }, 45000);
});

describe('getPlaywrightPage (mocked)', () => {
    it('connects via ws endpoint and runs onBeforeLoad', async () => {
        resetMocks();
        connect.mockResolvedValue(mockBrowser);
        connectOverCDP.mockResolvedValue(mockBrowser);
        launch.mockResolvedValue(mockBrowser);
        mockPage.goto.mockResolvedValue(undefined);
        mockBrowser.close.mockResolvedValue(undefined);
        process.env.PLAYWRIGHT_WS_ENDPOINT = 'ws://localhost:3000/?token=abc';
        proxyMock.getCurrentProxy.mockReturnValue(null);

        const getPlaywrightPage = await loadPlaywright();
        const onBeforeLoad = vi.fn();
        const contextClose = mockContext.close;
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
        expect(launchOptions.ignoreHTTPSErrors).toBeUndefined();
        expect(launchOptions.stealth).toBeUndefined();
        expect(launchOptions.headless).toBe(true);
        expect(onBeforeLoad).toHaveBeenCalled();

        await result.destroy();
        expect(contextClose).toHaveBeenCalled();
    });

    it('overrides an existing ws endpoint launch param, dropping invalid keys like stealth', async () => {
        resetMocks();
        connect.mockResolvedValue(mockBrowser);
        launch.mockResolvedValue(mockBrowser);
        mockPage.goto.mockResolvedValue(undefined);
        mockBrowser.close.mockResolvedValue(undefined);
        process.env.PLAYWRIGHT_WS_ENDPOINT = `ws://localhost:3000/?token=abc&launch=${encodeURIComponent(JSON.stringify({ stealth: true }))}`;
        proxyMock.getCurrentProxy.mockReturnValue(null);

        const getPlaywrightPage = await loadPlaywright();
        const result = await getPlaywrightPage('https://example.com', { noGoto: true });

        const endpoint = connect.mock.calls[0][0] as string;
        const launchOptions = JSON.parse(new URL(endpoint).searchParams.get('launch') || '{}');
        expect(launchOptions.stealth).toBeUndefined();
        expect(launchOptions.headless).toBe(true);
        expect(Array.isArray(launchOptions.args)).toBe(true);

        await result.destroy();
    });

    // Playwright WS uses `proxy` object (w/auth), while CDP uses `--proxy-server` (w/o auth).
    it.each([
        {
            name: 'WS route sends an unauthenticated proxy as a Playwright proxy object',
            route: 'ws',
            endpointVar: 'PLAYWRIGHT_WS_ENDPOINT',
            endpoint: 'ws://localhost:3000/?token=abc',
            proxyUri: 'http://proxy.local:8080',
            assertLaunch: (lo: any) => {
                expect(lo.proxy).toEqual({ server: 'http://proxy.local:8080' });
                expect(lo.args).not.toContainEqual(expect.stringContaining('--proxy-server='));
            },
        },
        {
            name: 'WS route sends an authenticated http proxy with credentials',
            route: 'ws',
            endpointVar: 'PLAYWRIGHT_WS_ENDPOINT',
            endpoint: 'ws://localhost:3000/?token=abc',
            proxyUri: 'http://user:pass@proxy.local:8080',
            assertLaunch: (lo: any) => {
                expect(lo.proxy).toEqual({ server: 'http://proxy.local:8080', username: 'user', password: 'pass' });
            },
        },
        {
            name: 'CDP route sends an unauthenticated proxy via the --proxy-server arg',
            route: 'cdp',
            endpointVar: 'PLAYWRIGHT_CDP_ENDPOINT',
            endpoint: 'ws://localhost:3000/chromium?token=abc',
            proxyUri: 'http://proxy.local:8080',
            assertLaunch: (lo: any) => {
                expect(lo.proxy).toBeUndefined();
                expect(lo.args).toContain('--proxy-server=http://proxy.local:8080');
                expect(lo.stealth).toBe(true);
            },
        },
        {
            name: 'CDP route skips an authenticated proxy (--proxy-server cannot carry credentials)',
            route: 'cdp',
            endpointVar: 'PLAYWRIGHT_CDP_ENDPOINT',
            endpoint: 'ws://localhost:3000/chromium?token=abc',
            proxyUri: 'http://user:pass@proxy.local:8080',
            assertLaunch: (lo: any) => {
                expect(lo.proxy).toBeUndefined();
                expect(lo.args).not.toContainEqual(expect.stringContaining('--proxy-server='));
            },
        },
    ])('$name', async ({ route, endpointVar, endpoint, proxyUri, assertLaunch }) => {
        resetMocks();
        connect.mockResolvedValue(mockBrowser);
        connectOverCDP.mockResolvedValue(mockBrowser);
        launch.mockResolvedValue(mockBrowser);
        mockPage.goto.mockResolvedValue(undefined);
        mockBrowser.close.mockResolvedValue(undefined);
        process.env[endpointVar] = endpoint;
        proxyMock.getCurrentProxy.mockReturnValue({ uri: proxyUri, urlHandler: new URL(proxyUri) });

        const getPlaywrightPage = await loadPlaywright();
        const result = await getPlaywrightPage('https://example.com', { noGoto: true });

        const connectMock = route === 'cdp' ? connectOverCDP : connect;
        const endpointUrl = connectMock.mock.calls[0][0] as string;
        const launchOptions = JSON.parse(new URL(endpointUrl).searchParams.get('launch') || '{}');
        assertLaunch(launchOptions);

        await result.destroy();
    });

    it('connects via connectOverCDP with stealth, taking priority over the WS endpoint when both are set', async () => {
        resetMocks();
        connect.mockResolvedValue(mockBrowser);
        connectOverCDP.mockResolvedValue(mockBrowser);
        launch.mockResolvedValue(mockBrowser);
        mockPage.goto.mockResolvedValue(undefined);
        mockBrowser.close.mockResolvedValue(undefined);
        process.env.PLAYWRIGHT_WS_ENDPOINT = 'ws://localhost:3000/chromium/playwright?token=abc';
        process.env.PLAYWRIGHT_CDP_ENDPOINT = 'ws://localhost:3000/chromium?token=abc';
        proxyMock.getCurrentProxy.mockReturnValue(null);

        const getPlaywrightPage = await loadPlaywright();
        const result = await getPlaywrightPage('https://example.com', { noGoto: true });

        expect(connectOverCDP).toHaveBeenCalled();
        expect(connect).not.toHaveBeenCalled();
        expect(launch).not.toHaveBeenCalled();
        const endpoint = connectOverCDP.mock.calls[0][0] as string;
        const launchOptions = JSON.parse(new URL(endpoint).searchParams.get('launch') || '{}');
        expect(launchOptions.stealth).toBe(true);
        expect(launchOptions.headless).toBe(true);

        await result.destroy();
    });

    it('does override the default HeadlessChrome user agent', async () => {
        resetMocks();
        launch.mockResolvedValue(mockBrowser);
        mockPage.goto.mockResolvedValue(undefined);
        proxyMock.getCurrentProxy.mockReturnValue(null);

        const getPlaywrightPage = await loadPlaywright();
        await getPlaywrightPage('https://example.com');

        expect(launch).toHaveBeenCalledWith(
            expect.objectContaining({
                args: expect.not.arrayContaining([expect.stringContaining('--user-agent=')]),
            })
        );
        expect(mockBrowser.newContext).toHaveBeenCalledWith(
            expect.objectContaining({
                userAgent: expect.any(String),
            })
        );
        const contextOptions = mockBrowser.newContext.mock.calls[0][0];
        expect(contextOptions.userAgent).not.toMatch(/HeadlessChrome/i);
    });

    it('supports extending the browser auto close timeout', async () => {
        vi.useFakeTimers();
        try {
            resetMocks();
            launch.mockResolvedValue(mockBrowser);
            mockBrowser.close.mockResolvedValue(undefined);
            mockPage.goto.mockResolvedValue(undefined);
            proxyMock.getCurrentProxy.mockReturnValue(null);

            const getPlaywrightPage = await loadPlaywright();
            const close = mockBrowser.close;
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
        launch.mockResolvedValue(mockBrowser);
        mockPage.goto.mockRejectedValueOnce(new Error('fail'));

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

import type { Browser, BrowserContext, BrowserContextOptions, LaunchOptions, Page } from 'patchright';
import { chromium } from 'patchright';

import { config } from '@/config';

import logger from './logger';
import proxy from './proxy';

type GotoOptions = Parameters<Page['goto']>[1];

type ProxyState = NonNullable<ReturnType<typeof proxy.getCurrentProxy>>;

const proxyServerFromUrl = (proxyUrl: URL) => {
    const protocol = proxyUrl.protocol.replace('socks5h:', 'socks5:').replace('socks4a:', 'socks4:');
    return `${protocol}//${proxyUrl.host}`;
};

const getProxyOptions = (currentProxy: ProxyState | null | undefined) => {
    if (!currentProxy) {
        return {};
    }

    const username = currentProxy.urlHandler?.username;
    const password = currentProxy.urlHandler?.password;
    if (username || password) {
        if (currentProxy.urlHandler.protocol !== 'http:') {
            logger.warn('SOCKS/HTTPS proxy with authentication is not supported by playwright, continue without proxy');
            return {};
        }

        return {
            proxy: {
                password: decodeURIComponent(password ?? ''),
                server: proxyServerFromUrl(currentProxy.urlHandler),
                username: decodeURIComponent(username ?? ''),
            },
        } satisfies Pick<LaunchOptions, 'proxy'>;
    }

    return {
        proxy: {
            server: currentProxy.uri.replace('socks5h://', 'socks5://').replace('socks4a://', 'socks4://').replace(/\/$/, ''),
        },
    } satisfies Pick<LaunchOptions, 'proxy'>;
};

// Patchright already patches playwright's default args (e.g. injects --disable-blink-features=AutomationControlled and strips --enable-automation)
const COMMON_LAUNCH_ARGS = ['--no-sandbox', '--disable-setuid-sandbox', '--window-position=0,0', '--ignore-certificate-errors', '--ignore-certificate-errors-spki-list'];

const getLaunchOptions = (currentProxy?: ProxyState | null): LaunchOptions => ({
    args: COMMON_LAUNCH_ARGS,
    executablePath: config.chromiumExecutablePath || undefined,
    headless: true,
    ...getProxyOptions(currentProxy),
});

type BrowserlessLaunchOptions = Pick<LaunchOptions, 'args' | 'headless' | 'proxy'>;
type BrowserlessCdpLaunchOptions = Omit<BrowserlessLaunchOptions, 'proxy'> & { stealth?: boolean };

const toBrowserlessLaunchOptions = (currentProxy?: ProxyState | null): BrowserlessLaunchOptions => ({
    args: COMMON_LAUNCH_ARGS,
    headless: true,
    ...getProxyOptions(currentProxy),
});

// CDP accepts `stealth` but NOT a `proxy` object.
const toBrowserlessCDPLaunchOptions = (currentProxy?: ProxyState | null): BrowserlessCdpLaunchOptions => {
    let proxyServerArgs: string[] = [];

    if (currentProxy) {
        if (currentProxy.urlHandler?.username || currentProxy.urlHandler?.password) {
            logger.warn('Proxy authentication is not supported over CDP (--proxy-server), continue without proxy');
        } else {
            const server = currentProxy.uri.replace('socks5h://', 'socks5://').replace('socks4a://', 'socks4://').replace(/\/$/, '');
            proxyServerArgs = [`--proxy-server=${server}`];
        }
    }

    return {
        args: [...COMMON_LAUNCH_ARGS, ...proxyServerArgs],
        headless: true,
        stealth: true,
    };
};

const getContextOptions = (): BrowserContextOptions => ({
    ignoreHTTPSErrors: true,
    userAgent: config.ua,
});

// CDP > WS > local
const launchBrowser = async (currentProxy?: ProxyState | null) => {
    let browser: Browser;
    if (config.playwrightCDPEndpoint) {
        browser = await chromium.connectOverCDP(getBrowserlessEndpoint(config.playwrightCDPEndpoint, toBrowserlessCDPLaunchOptions(currentProxy)));
    } else if (config.playwrightWSEndpoint) {
        browser = await chromium.connect(getBrowserlessEndpoint(config.playwrightWSEndpoint, toBrowserlessLaunchOptions(currentProxy)));
    } else {
        browser = await chromium.launch(getLaunchOptions(currentProxy));
    }
    const context = await browser.newContext(getContextOptions());
    return { browser, context };
};

const getBrowserlessEndpoint = (endpoint: string, launchOptions: BrowserlessLaunchOptions) => {
    const endpointURL = new URL(endpoint);
    endpointURL.searchParams.set('launch', JSON.stringify(launchOptions));
    return endpointURL.href;
};

const scheduleClose = (browser: Browser, timeout = 30000) => {
    setTimeout(() => {
        void browser.close();
    }, timeout);
};

/**
 * @returns Playwright browser context (native `newPage()` shares state across calls)
 */
const outPlaywright = async () => {
    const currentProxy = proxy.getCurrentProxy();
    const { browser, context } = await launchBrowser(currentProxy && proxy.proxyObj.url_regex === '.*' ? currentProxy : null);
    scheduleClose(browser);
    return context;
};

export default outPlaywright;

// No-op in Node.js environment (used by Worker build via alias)
export const setBrowserBinding = (_binding: any) => {};

/**
 * @returns Playwright page
 */
export const getPlaywrightPage = async (
    url: string,
    instanceOptions: {
        closeTimeout?: number;
        gotoConfig?: GotoOptions;
        noGoto?: boolean;
        onBeforeLoad?: (page: Page, context?: BrowserContext) => Promise<void> | void;
    } = {}
) => {
    let allowProxy = false;
    const proxyRegex = new RegExp(proxy.proxyObj.url_regex);
    let urlHandler: URL | undefined;
    try {
        urlHandler = new URL(url);
    } catch {
        // ignore invalid URLs such as about:blank
    }

    if (proxyRegex.test(url) && url.startsWith('http') && !(urlHandler && urlHandler.host === proxy.proxyUrlHandler?.host)) {
        allowProxy = true;
    }

    const currentProxy = proxy.getCurrentProxy();
    const currentProxyState = currentProxy && allowProxy ? currentProxy : null;
    const hasProxy = Boolean(getProxyOptions(currentProxyState).proxy);
    const { browser, context } = await launchBrowser(currentProxyState);
    scheduleClose(browser, instanceOptions.closeTimeout);
    const page = await context.newPage();

    if (hasProxy && currentProxyState) {
        logger.debug(`Proxying request in playwright via ${currentProxyState.uri}: ${url}`);
    }

    if (instanceOptions.onBeforeLoad) {
        await instanceOptions.onBeforeLoad(page, context);
    }

    if (!instanceOptions.noGoto) {
        try {
            await page.goto(url, instanceOptions.gotoConfig || { waitUntil: 'domcontentloaded' });
        } catch (error) {
            if (hasProxy && currentProxyState && proxy.multiProxy) {
                logger.warn(`Playwright navigation failed with proxy ${currentProxyState.uri}, marking as failed: ${error}`);
                proxy.markProxyFailed(currentProxyState.uri);
                throw error;
            }
            throw error;
        }
    }

    return {
        context,
        destroy: async () => {
            await context.close();
        },
        page,
    };
};

export { type Page } from 'patchright';

import type { Browser, BrowserContext, BrowserContextOptions, LaunchOptions, Page } from 'patchright';
import { chromium } from 'patchright';

import { config } from '@/config';

import logger from './logger';
import proxy from './proxy';

type GotoOptions = Parameters<Page['goto']>[1];

interface ProxyState {
    uri: string;
    urlHandler: URL | null;
}

const configuredProxy: ProxyState | null = proxy.proxyUri ? { uri: proxy.proxyUri, urlHandler: proxy.proxyUrlHandler } : null;
const proxyServerFromUrl = (proxyUrl: URL) => {
    const protocol = proxyUrl.protocol.replace('socks5h:', 'socks5:').replace('socks4a:', 'socks4:');
    return `${protocol}//${proxyUrl.host}`;
};

interface ProxyOptions {
    args: string[];
    proxy?: LaunchOptions['proxy'];
}

const getProxyOptions = (currentProxy: ProxyState | null | undefined): ProxyOptions => {
    if (!currentProxy) {
        return { args: [] };
    }

    if (proxy.proxyIsPAC) {
        return { args: [`--proxy-pac-url=${currentProxy.uri}`] };
    }

    const username = currentProxy.urlHandler?.username;
    const password = currentProxy.urlHandler?.password;
    if (username || password) {
        if (currentProxy.urlHandler!.protocol !== 'http:') {
            logger.warn('SOCKS/HTTPS proxy with authentication is not supported by playwright, continue without proxy');
            return { args: [] };
        }

        return {
            args: [],
            proxy: {
                password: decodeURIComponent(password ?? ''),
                server: proxyServerFromUrl(currentProxy.urlHandler!),
                username: decodeURIComponent(username ?? ''),
            },
        };
    }

    return {
        args: [],
        proxy: {
            server: currentProxy.uri.replace('socks5h://', 'socks5://').replace('socks4a://', 'socks4://').replace(/\/$/, ''),
        },
    };
};

// Patchright already patches playwright's default args (e.g. injects --disable-blink-features=AutomationControlled and strips --enable-automation)
const COMMON_LAUNCH_ARGS = ['--no-sandbox', '--disable-setuid-sandbox', '--window-position=0,0', '--ignore-certificate-errors', '--ignore-certificate-errors-spki-list'];

const getLaunchOptions = (proxyOptions: ProxyOptions): LaunchOptions => ({
    args: [...COMMON_LAUNCH_ARGS, ...proxyOptions.args],
    channel: proxy.proxyIsPAC ? 'chromium' : undefined,
    executablePath: config.chromiumExecutablePath || undefined,
    headless: true,
    proxy: proxyOptions.proxy,
});

type BrowserlessLaunchOptions = Pick<LaunchOptions, 'args' | 'headless' | 'proxy'>;
type BrowserlessCdpLaunchOptions = Omit<BrowserlessLaunchOptions, 'proxy'> & { stealth?: boolean };

const toBrowserlessLaunchOptions = (proxyOptions: ProxyOptions): BrowserlessLaunchOptions => ({
    args: [...COMMON_LAUNCH_ARGS, ...proxyOptions.args],
    headless: true,
    proxy: proxyOptions.proxy,
});

// CDP accepts `stealth` but NOT a `proxy` object.
const toBrowserlessCDPLaunchOptions = (proxyOptions: ProxyOptions): BrowserlessCdpLaunchOptions => {
    const args = [...COMMON_LAUNCH_ARGS, ...proxyOptions.args];

    if (proxyOptions.proxy?.username || proxyOptions.proxy?.password) {
        logger.warn('Proxy authentication is not supported over CDP (--proxy-server), continue without proxy');
    } else if (proxyOptions.proxy) {
        args.push(`--proxy-server=${proxyOptions.proxy.server}`);
    }

    return {
        args,
        headless: true,
        stealth: true,
    };
};

const getContextOptions = (javaScriptEnabled?: boolean): BrowserContextOptions => ({
    ...(javaScriptEnabled !== undefined && { javaScriptEnabled }),
    ignoreHTTPSErrors: true,
    userAgent: config.ua,
});

// CDP > WS > local
const launchBrowser = async (proxyOptions: ProxyOptions, javaScriptEnabled?: boolean) => {
    let browser: Browser;
    if (config.playwrightCDPEndpoint) {
        browser = await chromium.connectOverCDP(getBrowserlessEndpoint(config.playwrightCDPEndpoint, toBrowserlessCDPLaunchOptions(proxyOptions)));
    } else if (config.playwrightWSEndpoint) {
        browser = await chromium.connect(getBrowserlessEndpoint(config.playwrightWSEndpoint, toBrowserlessLaunchOptions(proxyOptions)));
    } else {
        browser = await chromium.launch(getLaunchOptions(proxyOptions));
    }
    try {
        const context = await browser.newContext(getContextOptions(javaScriptEnabled));
        return { browser, context };
    } catch (error) {
        await browser.close();
        throw error;
    }
};

const getBrowserlessEndpoint = (endpoint: string, launchOptions: BrowserlessLaunchOptions) => {
    const endpointURL = new URL(endpoint);
    endpointURL.searchParams.set('launch', JSON.stringify(launchOptions));
    return endpointURL.href;
};

const scheduleClose = (browser: Browser, timeout = 30000) =>
    timeout === 0
        ? undefined
        : setTimeout(() => {
              void browser.close();
          }, timeout);

/**
 * @returns Playwright browser context (native `newPage()` shares state across calls)
 */
export default async function outPlaywright() {
    const { browser, context } = await launchBrowser(getProxyOptions(proxy.proxyObj.url_regex === '.*' ? configuredProxy : null));
    scheduleClose(browser);
    return context;
}

// No-op in Node.js environment (used by Worker build via alias)
export const setBrowserBinding = (_binding: any) => {};

/**
 * @returns Playwright page
 */
export const getPlaywrightPage = async (
    url: string,
    instanceOptions: {
        // Set to zero only when the caller always awaits destroy() in finally.
        closeTimeout?: number;
        gotoConfig?: GotoOptions;
        noGoto?: boolean;
        javaScriptEnabled?: boolean;
        useConfiguredEndpoint?: boolean;
        onBeforeLoad?: (page: Page, context?: BrowserContext) => Promise<void> | void;
    } = {}
) => {
    if (instanceOptions.useConfiguredEndpoint && !config.playwrightWSEndpoint && !config.playwrightCDPEndpoint) {
        throw new Error('Configure PLAYWRIGHT_WS_ENDPOINT or PLAYWRIGHT_CDP_ENDPOINT to use the remote Playwright browser.');
    }
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

    const currentProxyState = allowProxy ? configuredProxy : null;
    const proxyOptions = getProxyOptions(currentProxyState);
    const hasProxy = Boolean(proxyOptions.proxy || proxyOptions.args.length);
    const { browser, context } = await launchBrowser(proxyOptions, instanceOptions.javaScriptEnabled);
    const closeTimer = scheduleClose(browser, instanceOptions.closeTimeout);
    const destroy = async () => {
        clearTimeout(closeTimer);
        await browser.close();
    };

    try {
        const page = await context.newPage();

        if (hasProxy) {
            logger.debug(`Proxying request in playwright: ${url}`);
        }

        if (instanceOptions.onBeforeLoad) {
            await instanceOptions.onBeforeLoad(page, context);
        }

        if (!instanceOptions.noGoto) {
            await page.goto(url, instanceOptions.gotoConfig || { waitUntil: 'domcontentloaded' });
        }

        return {
            context,
            destroy,
            page,
        };
    } catch (error) {
        await destroy();
        throw error;
    }
};

export { type Page } from 'patchright';

// Worker-compatible Playwright using Cloudflare Browser Run.
import type { Browser as PlaywrightBrowser, BrowserContext, Page as PlaywrightPage, Request as PlaywrightRequest, Response as PlaywrightResponse, Route } from '@cloudflare/playwright';
import { launch } from '@cloudflare/playwright';

import { config } from '@/config';

import logger from './logger';

type SetCookieParam = Parameters<BrowserContext['addCookies']>[0][number];
type Cookie = Awaited<ReturnType<BrowserContext['cookies']>>[number];
type GotoOptions = Parameters<PlaywrightPage['goto']>[1] & {
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'networkidle0' | 'networkidle2';
};

type RouteRequest = {
    abort: (errorCode?: string) => Promise<void>;
    continue: (options?: Parameters<Route['continue']>[0]) => Promise<void>;
    resourceType: () => ReturnType<PlaywrightRequest['resourceType']>;
    url: () => string;
};

type FinishedRequest = {
    response: () => {
        status: () => number;
    } | null;
    url: () => string;
};

type RequestHandler = (request: RouteRequest) => Promise<void> | void;
type RequestFinishedHandler = (request: FinishedRequest) => Promise<void> | void;
type HandledRouteRequest = RouteRequest & { handled: boolean };

export type Page = PlaywrightPage & {
    authenticate: (credentials: { password?: string; username?: string }) => Promise<void>;
    cookies: (urls?: string | string[]) => Promise<Cookie[]>;
    goto: (url: string, options?: GotoOptions) => ReturnType<PlaywrightPage['goto']>;
    on: ((event: 'request', handler: RequestHandler) => Page) & ((event: 'requestfinished', handler: RequestFinishedHandler) => Page) & PlaywrightPage['on'];
    setCookie: (...cookies: SetCookieParam[]) => Promise<void>;
    setRequestInterception: (enabled: boolean) => Promise<void>;
    setUserAgent: (userAgent: string) => Promise<void>;
};

export type Browser = PlaywrightBrowser & {
    cookies: (urls?: string | string[]) => Promise<Cookie[]>;
    newPage: () => Promise<Page>;
    setCookie: (...cookies: SetCookieParam[]) => Promise<void>;
    userAgent: () => string;
};

let browserBinding: any = null;

export const setBrowserBinding = (binding: any) => {
    browserBinding = binding;
};

const getBrowserBinding = () => {
    if (!browserBinding) {
        throw new Error('Browser Run API not available. This route requires Cloudflare Browser Run which is only available in remote mode. Use `wrangler dev --remote` or deploy to Cloudflare Workers.');
    }
    return browserBinding;
};

const normalizeWaitUntil = (waitUntil: GotoOptions['waitUntil']) => (waitUntil === 'networkidle0' || waitUntil === 'networkidle2' ? 'networkidle' : waitUntil);

const normalizeGotoOptions = (options?: GotoOptions): Parameters<PlaywrightPage['goto']>[1] | undefined =>
    options
        ? {
              ...options,
              waitUntil: normalizeWaitUntil(options.waitUntil),
          }
        : options;

const withDefaultCookiePath = (cookie: SetCookieParam): SetCookieParam => ('domain' in cookie && !('path' in cookie) ? { ...cookie, path: '/' } : cookie);

const createRouteRequest = (route: Route): HandledRouteRequest => {
    const request = route.request();
    const routeRequest = {
        abort: async (errorCode) => {
            routeRequest.handled = true;
            await route.abort(errorCode);
        },
        continue: async (options) => {
            routeRequest.handled = true;
            await route.continue(options);
        },
        handled: false,
        resourceType: () => request.resourceType(),
        url: () => request.url(),
    };
    return routeRequest;
};

const runRequestHandlers = async (handlers: RequestHandler[], request: HandledRouteRequest, index = 0): Promise<void> => {
    if (request.handled || index >= handlers.length) {
        return;
    }

    await handlers[index](request);
    await runRequestHandlers(handlers, request, index + 1);
};

const createFinishedRequest = (request: PlaywrightRequest, response: PlaywrightResponse | null): FinishedRequest => ({
    response: () =>
        response
            ? {
                  status: () => response.status(),
              }
            : null,
    url: () => request.url(),
});

const patchPage = (page: PlaywrightPage, context: BrowserContext): Page => {
    const compatPage = page as Page;
    const requestHandlers: RequestHandler[] = [];
    const originalGoto = page.goto.bind(page);
    const originalOn = page.on.bind(page);
    const originalRoute = page.route.bind(page);
    const originalUnroute = page.unroute.bind(page);
    let routeHandler: ((route: Route) => Promise<void>) | undefined;
    let requestInterceptionEnabled = false;

    compatPage.goto = (url, options) => originalGoto(url, normalizeGotoOptions(options));
    compatPage.cookies = (urls) => context.cookies(urls);
    compatPage.setCookie = async (...cookies) => {
        await context.addCookies(cookies.map((cookie) => withDefaultCookiePath(cookie)));
    };
    compatPage.authenticate = async () => {};
    compatPage.setUserAgent = async (userAgent) => {
        await page.setExtraHTTPHeaders({
            'User-Agent': userAgent,
        });
    };
    compatPage.setRequestInterception = async (enabled) => {
        requestInterceptionEnabled = enabled;
        if (enabled && !routeHandler) {
            routeHandler = async (route) => {
                const request = createRouteRequest(route);
                await runRequestHandlers(requestHandlers, request);
                if (request.handled) {
                    return;
                }
                await route.continue();
            };
            await originalRoute('**/*', routeHandler);
        } else if (!enabled && routeHandler) {
            await originalUnroute('**/*', routeHandler);
            routeHandler = undefined;
        }
    };
    compatPage.on = ((event: string, handler: (...args: any[]) => any) => {
        if (event === 'request') {
            requestHandlers.push(handler as RequestHandler);
            if (!requestInterceptionEnabled) {
                originalOn(event, handler);
            }
            return compatPage;
        }
        if (event === 'requestfinished') {
            originalOn(event, async (request) => {
                const response = await request.response();
                await (handler as RequestFinishedHandler)(createFinishedRequest(request, response));
            });
            return compatPage;
        }
        originalOn(event, handler);
        return compatPage;
    }) as Page['on'];

    return compatPage;
};

const createCompatBrowser = async (browser: PlaywrightBrowser): Promise<Browser> => {
    const context = await browser.newContext({
        ignoreHTTPSErrors: true,
    });
    const compatBrowser = browser as Browser;
    const originalClose = browser.close.bind(browser);

    compatBrowser.newPage = async () => patchPage(await context.newPage(), context);
    compatBrowser.setCookie = async (...cookies) => {
        await context.addCookies(cookies.map((cookie) => withDefaultCookiePath(cookie)));
    };
    compatBrowser.cookies = (urls) => context.cookies(urls);
    compatBrowser.userAgent = () => config.ua;
    compatBrowser.close = async (options) => {
        try {
            await context.close();
        } catch {
            // Ignore already-closed contexts.
        }
        await originalClose(options);
    };

    return compatBrowser;
};

const launchBrowser = async () => createCompatBrowser(await launch(getBrowserBinding(), { keep_alive: 60000 }));

const scheduleClose = (browser: Browser) => {
    setTimeout(() => {
        void browser.close();
    }, 30000);
};

/**
 * @returns Playwright browser
 */
const outPlaywright = async () => {
    const browser = await launchBrowser();
    scheduleClose(browser);
    return browser;
};

export default outPlaywright;

/**
 * @returns Playwright page
 */
export const getPlaywrightPage = async (
    url: string,
    instanceOptions: {
        gotoConfig?: GotoOptions;
        noGoto?: boolean;
        onBeforeLoad?: (page: Page, browser?: Browser) => Promise<void> | void;
    } = {}
) => {
    logger.debug(`Launching Cloudflare Browser for: ${url}`);

    const browser = await launchBrowser();
    scheduleClose(browser);
    const page = await browser.newPage();

    if (instanceOptions.onBeforeLoad) {
        await instanceOptions.onBeforeLoad(page, browser);
    }

    if (!instanceOptions.noGoto) {
        try {
            await page.goto(url, instanceOptions.gotoConfig || { waitUntil: 'domcontentloaded' });
        } catch (error) {
            logger.error(`Playwright navigation failed: ${error}`);
            throw error;
        }
    }

    return {
        browser,
        destroy: async () => {
            await browser.close();
        },
        page,
    };
};

export const getPuppeteerPage = getPlaywrightPage;

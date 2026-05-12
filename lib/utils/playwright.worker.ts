// Worker-compatible Playwright using Cloudflare Browser Run.
import type { Browser as PlaywrightBrowser, Page as PlaywrightPage } from '@cloudflare/playwright';
import { launch } from '@cloudflare/playwright';

import { config } from '@/config';

import logger from './logger';

type GotoOptions = Parameters<PlaywrightPage['goto']>[1];

export type Page = PlaywrightPage & {
    authenticate: (credentials: { password?: string; username?: string }) => Promise<void>;
    setUserAgent: (userAgent: string) => Promise<void>;
};

export type Browser = PlaywrightBrowser & {
    newPage: () => Promise<Page>;
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

const patchPage = (page: PlaywrightPage): Page => {
    const compatPage = page as Page;

    compatPage.authenticate = async () => {};
    compatPage.setUserAgent = async (userAgent) => {
        await page.setExtraHTTPHeaders({
            'User-Agent': userAgent,
        });
    };

    return compatPage;
};

const createCompatBrowser = async (browser: PlaywrightBrowser): Promise<Browser> => {
    const context = await browser.newContext({
        ignoreHTTPSErrors: true,
    });
    const compatBrowser = browser as Browser;

    compatBrowser.newPage = async () => patchPage(await context.newPage());
    compatBrowser.userAgent = () => config.ua;

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

// Worker-compatible Playwright using Cloudflare Browser Run.
import type { Browser, Page } from '@cloudflare/playwright';
import { launch } from '@cloudflare/playwright';

import logger from './logger';

type GotoOptions = Parameters<Page['goto']>[1];

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

const launchBrowser = async () => {
    const browser = await launch(getBrowserBinding(), { keep_alive: 60000 });
    const context = await browser.newContext({
        ignoreHTTPSErrors: true,
    });
    return { browser, context };
};

const scheduleClose = (browser: Browser) => {
    setTimeout(() => {
        void browser.close();
    }, 30000);
};

/**
 * @returns Playwright browser context (native `newPage()` shares state across calls)
 */
export default async function outPlaywright() {
    const { browser, context } = await launchBrowser();
    scheduleClose(browser);
    return context;
}

/**
 * @returns Playwright page
 */
export const getPlaywrightPage = async (
    url: string,
    instanceOptions: {
        gotoConfig?: GotoOptions;
        noGoto?: boolean;
        onBeforeLoad?: (page: Page, context?: Awaited<ReturnType<typeof launchBrowser>>['context']) => Promise<void> | void;
    } = {}
) => {
    logger.debug(`Launching Cloudflare Browser for: ${url}`);

    const { browser, context } = await launchBrowser();
    scheduleClose(browser);
    const page = await context.newPage();

    if (instanceOptions.onBeforeLoad) {
        await instanceOptions.onBeforeLoad(page, context);
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
        context,
        destroy: async () => {
            await context.close();
        },
        page,
    };
};

export { type Page } from '@cloudflare/playwright';

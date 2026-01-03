// Worker-compatible puppeteer using @cloudflare/puppeteer
// This module uses Cloudflare Browser Rendering API
import type { Browser, Page } from '@cloudflare/puppeteer';
import puppeteer from '@cloudflare/puppeteer';

import { config } from '@/config';

import logger from './logger';

// Browser binding from wrangler.toml
// This will be set by the Worker runtime
let browserBinding: any = null;

// Set the browser binding from the Worker environment
export const setBrowserBinding = (binding: any) => {
    browserBinding = binding;
};

/**
 * Get the browser binding from the execution context
 * In Cloudflare Workers, bindings are passed via the env parameter in fetch handler
 */
const getBrowserBinding = () => {
    if (!browserBinding) {
        throw new Error('Browser Rendering API not available. ' + 'This route requires Cloudflare Browser Rendering which is only available in remote mode. ' + 'Use `wrangler dev --remote` or deploy to Cloudflare Workers.');
    }
    return browserBinding;
};

/**
 * @deprecated use getPuppeteerPage instead
 * @returns Puppeteer browser
 */
const outPuppeteer = async () => {
    const binding = getBrowserBinding();
    const browser = await puppeteer.launch(binding, {
        keep_alive: 60000, // Keep browser alive for 1 minute
    });

    setTimeout(async () => {
        await browser.close();
    }, 30000);

    return browser;
};

export default outPuppeteer;

/**
 * @returns Puppeteer page
 */
export const getPuppeteerPage = async (
    url: string,
    instanceOptions: {
        onBeforeLoad?: (page: Page, browser?: Browser) => Promise<void> | void;
        gotoConfig?: {
            waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
        };
        noGoto?: boolean;
    } = {}
) => {
    const binding = getBrowserBinding();

    logger.debug(`Launching Cloudflare Browser for: ${url}`);

    const browser = await puppeteer.launch(binding, {
        keep_alive: 60000, // Keep browser alive for 1 minute for session reuse
    });

    setTimeout(async () => {
        await browser.close();
    }, 30000);

    const page = await browser.newPage();

    // Set user agent
    await page.setUserAgent(config.ua);

    if (instanceOptions.onBeforeLoad) {
        await instanceOptions.onBeforeLoad(page, browser);
    }

    if (!instanceOptions.noGoto) {
        try {
            await page.goto(url, instanceOptions.gotoConfig || { waitUntil: 'domcontentloaded' });
        } catch (error) {
            logger.error(`Puppeteer navigation failed: ${error}`);
            throw error;
        }
    }

    return {
        page,
        destory: async () => {
            await browser.close();
        },
        browser,
    };
};

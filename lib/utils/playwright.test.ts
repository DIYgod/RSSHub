import type { BrowserContext } from 'patchright';
import { afterEach, describe, expect, it, vi } from 'vitest';

import wait from './wait';

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

    vi.resetModules();
});

describe('playwright', () => {
    it('playwright run', async () => {
        const { default: playwright } = await import('./playwright');
        context = await playwright();
        const browser = context.browser();
        const startTime = Date.now();
        const page = await context.newPage();
        await page.goto('https://www.google.com', {
            waitUntil: 'domcontentloaded',
        });

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

describe('getPlaywrightPage', () => {
    it('playwright run', async () => {
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

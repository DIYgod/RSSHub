import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Browser } from '@/utils/playwright';

import wait from './wait';

let browser: Browser | null = null;

afterEach(async () => {
    if (browser) {
        await browser.close();
        browser = null;
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
        browser = await playwright();
        const startTime = Date.now();
        const page = await browser.newPage();
        await page.goto('https://www.google.com', {
            waitUntil: 'domcontentloaded',
        });

        const html = await page.evaluate(() => document.body.innerHTML);
        expect(html.length).toBeGreaterThan(0);

        expect(browser.isConnected()).toBe(true);
        const sleepTime = 31 * 1000 - (Date.now() - startTime);
        if (sleepTime > 0) {
            await wait(sleepTime);
        }
        expect(browser.isConnected()).toBe(false);
        browser = null;
    }, 45000);
});

describe('getPlaywrightPage', () => {
    it('playwright run', async () => {
        const { getPlaywrightPage } = await import('./playwright');
        const playwright = await getPlaywrightPage('https://www.google.com');
        const page = playwright.page;
        browser = playwright.browser;
        const startTime = Date.now();

        const html = await page.evaluate(() => document.body.innerHTML);
        expect(html.length).toBeGreaterThan(0);

        expect(browser.isConnected()).toBe(true);
        const sleepTime = 31 * 1000 - (Date.now() - startTime);
        if (sleepTime > 0) {
            await wait(sleepTime);
        }
        expect(browser.isConnected()).toBe(false);
        browser = null;
    }, 45000);
});

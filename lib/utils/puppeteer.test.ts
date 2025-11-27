import type { Browser } from 'rebrowser-puppeteer';
import { afterEach, describe, expect, it, vi } from 'vitest';

import wait from './wait';

let browser: Browser | null = null;

afterEach(async () => {
    if (browser) {
        // double insurance to close unclosed browser immediately after each test
        // if a test closure fails before it can close the browser, the browser process will probably be unclosed,
        // especially when the test unit is run through `npm run vitest puppeteer`
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

describe('puppeteer', () => {
    it('puppeteer run', async () => {
        const { default: puppeteer } = await import('./puppeteer');
        browser = await puppeteer();
        const startTime = Date.now();
        const page = await browser.newPage();
        await page.goto('https://www.google.com', {
            waitUntil: 'domcontentloaded',
        });

        const html = await page.evaluate(() => document.body.innerHTML);
        expect(html.length).toBeGreaterThan(0);

        expect(browser.process()?.exitCode).toBe(null); // browser is still running
        const sleepTime = 31 * 1000 - (Date.now() - startTime); // prevent long loading time from failing the test
        if (sleepTime > 0) {
            await wait(sleepTime);
        }
        expect(browser.process()?.exitCode).toBe(0); // browser is closed
        browser = null;
    }, 45000);

    // if (!process.env.GITHUB_ACTIONS) {
    it('puppeteer stealth test', async () => {
        const { default: puppeteer } = await import('./puppeteer');
        browser = await puppeteer();
        const page = await browser.newPage();
        await page.goto('https://bot.sannysoft.com', { waitUntil: 'networkidle0' });
        // page rendering is not instant, wait for expected elements to appear
        const [webDriverTest, chromeTest] = await Promise.all(['webdriver', 'chrome'].map((t) => page.waitForSelector(`td#${t}-result.result.passed`).then((hd) => hd?.evaluate((e) => e.textContent))));
        // these are something we really care about
        expect(webDriverTest).toBe('missing (passed)');
        expect(chromeTest).toBe('present (passed)');
    }, 45000);
    // }

    it('puppeteer accept http proxy uri w/ auth', async () => {
        process.env.PROXY_URI = 'http://user:pass@rsshub.proxy:2333';

        const { default: puppeteer } = await import('./puppeteer');
        browser = await puppeteer();

        // trailing slash will cause net::ERR_NO_SUPPORTED_PROXIES, prohibit it
        expect(browser.process()?.spawnargs.some((arg) => /^--proxy-server=http:\/\/.*[^/]$/.test(arg))).toBe(true);
    });

    it('puppeteer reject https proxy uri w/ auth', async () => {
        process.env.PROXY_URI = 'https://user:pass@rsshub.proxy:2333';

        const { default: puppeteer } = await import('./puppeteer');
        browser = await puppeteer();

        expect(browser.process()?.spawnargs.some((arg) => arg.includes('--proxy-server'))).toBe(false);
    });

    it('puppeteer reject socks proxy uri w/ auth', async () => {
        process.env.PROXY_URI = 'socks5://user:pass@rsshub.proxy:2333';

        const { default: puppeteer } = await import('./puppeteer');
        browser = await puppeteer();

        expect(browser.process()?.spawnargs.some((arg) => arg.includes('--proxy-server'))).toBe(false);
    });

    it('puppeteer accept http proxy', async () => {
        process.env.PROXY_PROTOCOL = 'http';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        const { default: puppeteer } = await import('./puppeteer');
        browser = await puppeteer();

        expect(browser.process()?.spawnargs.some((arg) => /^--proxy-server=http:\/\/rsshub.proxy:2333$/.test(arg))).toBe(true);
    }, 10000);

    it('puppeteer accept https proxy', async () => {
        process.env.PROXY_PROTOCOL = 'https';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        const { default: puppeteer } = await import('./puppeteer');
        browser = await puppeteer();

        expect(browser.process()?.spawnargs.some((arg) => /^--proxy-server=https:\/\/rsshub.proxy:2333$/.test(arg))).toBe(true);
    }, 10000);

    it('puppeteer accept socks4a proxy', async () => {
        process.env.PROXY_PROTOCOL = 'socks4a';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        const { default: puppeteer } = await import('./puppeteer');
        browser = await puppeteer();

        expect(browser.process()?.spawnargs.some((arg) => /^--proxy-server=socks4:\/\/rsshub.proxy:2333$/.test(arg))).toBe(true);
    }, 10000);

    it('puppeteer accept socks5h proxy', async () => {
        process.env.PROXY_PROTOCOL = 'socks5h';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        const { default: puppeteer } = await import('./puppeteer');
        browser = await puppeteer();

        expect(browser.process()?.spawnargs.some((arg) => /^--proxy-server=socks5:\/\/rsshub.proxy:2333$/.test(arg))).toBe(true);
    }, 10000);
});

describe('getPuppeteerPage', () => {
    it('puppeteer run', async () => {
        const { getPuppeteerPage } = await import('./puppeteer');
        const pup = await getPuppeteerPage('https://www.google.com');
        const page = pup.page;
        browser = pup.browser;
        const startTime = Date.now();

        const html = await page.evaluate(() => document.body.innerHTML);
        expect(html.length).toBeGreaterThan(0);

        expect(browser.process()?.exitCode).toBe(null); // browser is still running
        const sleepTime = 31 * 1000 - (Date.now() - startTime); // prevent long loading time from failing the test
        if (sleepTime > 0) {
            await wait(sleepTime);
        }
        expect(browser.process()?.exitCode).toBe(0); // browser is closed
    }, 45000);

    it('puppeteer accept http proxy uri w/ auth', async () => {
        process.env.PROXY_URI = 'http://user:pass@rsshub.proxy:2333';

        const { getPuppeteerPage } = await import('./puppeteer');
        const pup = await getPuppeteerPage('https://www.google.com', {
            noGoto: true,
        });
        browser = pup.browser;

        // trailing slash will cause net::ERR_NO_SUPPORTED_PROXIES, prohibit it
        expect(browser.process()?.spawnargs.includes('--proxy-server=http://rsshub.proxy:2333')).toBe(true);
    });

    it('puppeteer respect proxy regex', async () => {
        process.env.PROXY_URI = 'http://user:pass@rsshub.proxy:2333';
        process.env.PROXY_URL_REGEX = 'not-exist';

        const { getPuppeteerPage } = await import('./puppeteer');
        const pup = await getPuppeteerPage('https://www.google.com');
        browser = pup.browser;

        // trailing slash will cause net::ERR_NO_SUPPORTED_PROXIES, prohibit it
        expect(browser.process()?.spawnargs.includes('--proxy-server=http://rsshub.proxy:2333')).toBe(false);
    });

    it('puppeteer reject https proxy uri w/ auth', async () => {
        process.env.PROXY_URI = 'https://user:pass@rsshub.proxy:2333';

        const { getPuppeteerPage } = await import('./puppeteer');
        const pup = await getPuppeteerPage('https://www.google.com');
        browser = pup.browser;

        expect(browser.process()?.spawnargs.some((arg) => arg.includes('--proxy-server'))).toBe(false);
    });

    it('puppeteer reject socks proxy uri w/ auth', async () => {
        process.env.PROXY_URI = 'socks5://user:pass@rsshub.proxy:2333';

        const { getPuppeteerPage } = await import('./puppeteer');
        const pup = await getPuppeteerPage('https://www.google.com');
        browser = pup.browser;

        expect(browser.process()?.spawnargs.some((arg) => arg.includes('--proxy-server'))).toBe(false);
    });

    it('puppeteer accept http proxy', async () => {
        process.env.PROXY_PROTOCOL = 'http';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        const { getPuppeteerPage } = await import('./puppeteer');
        const pup = await getPuppeteerPage('https://www.google.com', {
            noGoto: true,
        });
        browser = pup.browser;

        expect(browser.process()?.spawnargs.includes('--proxy-server=http://rsshub.proxy:2333')).toBe(true);
    }, 10000);

    it('puppeteer accept https proxy', async () => {
        process.env.PROXY_PROTOCOL = 'https';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        const { getPuppeteerPage } = await import('./puppeteer');
        const pup = await getPuppeteerPage('https://www.google.com', {
            noGoto: true,
        });
        browser = pup.browser;

        expect(browser.process()?.spawnargs.includes('--proxy-server=https://rsshub.proxy:2333')).toBe(true);
    }, 10000);

    it('puppeteer accept socks4a proxy', async () => {
        process.env.PROXY_PROTOCOL = 'socks4a';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        const { getPuppeteerPage } = await import('./puppeteer');
        const pup = await getPuppeteerPage('https://www.google.com', {
            noGoto: true,
        });
        browser = pup.browser;

        expect(browser.process()?.spawnargs.includes('--proxy-server=socks4://rsshub.proxy:2333')).toBe(true);
    }, 10000);

    it('puppeteer accept socks5h proxy', async () => {
        process.env.PROXY_PROTOCOL = 'socks5h';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        const { getPuppeteerPage } = await import('./puppeteer');
        const pup = await getPuppeteerPage('https://www.google.com', {
            noGoto: true,
        });
        browser = pup.browser;

        expect(browser.process()?.spawnargs.includes('--proxy-server=socks5://rsshub.proxy:2333')).toBe(true);
    }, 10000);
});

let puppeteer;
const wait = require('../../lib/utils/wait');

let browser = null;

afterEach(() => {
    if (browser) {
        // double insurance to close unclosed browser immediately after each test
        // if a test closure fails before it can close the browser, the browser process will probably be unclosed,
        // especially when the test unit is run through `npm run jest puppeteer`
        browser.close();
        browser = null;
    }
    delete process.env.PROXY_URI;
    delete process.env.PROXY_PROTOCOL;
    delete process.env.PROXY_HOST;
    delete process.env.PROXY_PORT;
    delete process.env.PROXY_AUTH;

    jest.resetModules();
});

describe('puppeteer', () => {
    it('puppeteer run', async () => {
        puppeteer = require('../../lib/utils/puppeteer');
        browser = await puppeteer();
        const startTime = Date.now();
        const page = await browser.newPage();
        await page.goto('https://www.google.com', {
            waitUntil: 'domcontentloaded',
        });

        const html = await page.evaluate(() => document.body.innerHTML);
        expect(html.length).toBeGreaterThan(0);

        expect(browser.process().exitCode).toBe(null); // browser is still running
        const sleepTime = 31 * 1000 - (Date.now() - startTime); // prevent long loading time from failing the test
        if (sleepTime > 0) {
            await wait(sleepTime);
        }
        expect(browser.process().exitCode).toBe(0); // browser is closed
        browser = null;
    }, 45000);

    if (!process.env.GITHUB_ACTIONS) {
        it('puppeteer without stealth', async () => {
            puppeteer = require('../../lib/utils/puppeteer');
            browser = await puppeteer({ stealth: false });
            const page = await browser.newPage();
            await page.goto('https://bot.sannysoft.com', { waitUntil: 'networkidle0' });
            // page rendering is not instant, wait for expected elements to appear
            const [webDriverTest, chromeTest] = await Promise.all(['webdriver', 'chrome'].map((t) => page.waitForSelector(`td#${t}-result.result.failed`).then((hd) => hd.evaluate((e) => e.textContent))));
            // the website return empty string from time to time for no reason
            // since we don't really care whether puppeteer without stealth passes the bot test, just let it go
            expect(['present (failed)', '']).toContain(webDriverTest);
            expect(['missing (failed)', '']).toContain(chromeTest);
        }, 15000);

        it('puppeteer with stealth', async () => {
            puppeteer = require('../../lib/utils/puppeteer');
            browser = await puppeteer({ stealth: true });
            const page = await browser.newPage();
            await page.goto('https://bot.sannysoft.com', { waitUntil: 'networkidle0' });
            // page rendering is not instant, wait for expected elements to appear
            const [webDriverTest, chromeTest] = await Promise.all(['webdriver', 'chrome'].map((t) => page.waitForSelector(`td#${t}-result.result.passed`).then((hd) => hd.evaluate((e) => e.textContent))));
            // these are something we really care about
            expect(webDriverTest).toBe('missing (passed)');
            expect(chromeTest).toBe('present (passed)');
        }, 15000);
    }

    it('puppeteer accept http proxy uri w/ auth', async () => {
        process.env.PROXY_URI = 'http://user:pass@rsshub.proxy:2333';

        puppeteer = require('../../lib/utils/puppeteer');
        browser = await puppeteer();

        // trailing slash will cause net::ERR_NO_SUPPORTED_PROXIES, prohibit it
        expect(browser.process().spawnargs.some((arg) => /^--proxy-server=http:\/\/.*[^/]$/.test(arg))).toBe(true);
    });

    it('puppeteer reject https proxy uri w/ auth', async () => {
        process.env.PROXY_URI = 'https://user:pass@rsshub.proxy:2333';

        puppeteer = require('../../lib/utils/puppeteer');
        browser = await puppeteer();

        expect(browser.process().spawnargs.some((arg) => arg.includes('--proxy-server'))).toBe(false);
    });

    it('puppeteer reject socks proxy uri w/ auth', async () => {
        process.env.PROXY_URI = 'socks5://user:pass@rsshub.proxy:2333';

        puppeteer = require('../../lib/utils/puppeteer');
        browser = await puppeteer();

        expect(browser.process().spawnargs.some((arg) => arg.includes('--proxy-server'))).toBe(false);
    });

    it('puppeteer accept http proxy', async () => {
        process.env.PROXY_PROTOCOL = 'http';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        puppeteer = require('../../lib/utils/puppeteer');
        browser = await puppeteer();

        expect(browser.process().spawnargs.some((arg) => /^--proxy-server=http:\/\/rsshub.proxy:2333$/.test(arg))).toBe(true);
    }, 10000);

    it('puppeteer accept https proxy', async () => {
        process.env.PROXY_PROTOCOL = 'https';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        puppeteer = require('../../lib/utils/puppeteer');
        browser = await puppeteer();

        expect(browser.process().spawnargs.some((arg) => /^--proxy-server=https:\/\/rsshub.proxy:2333$/.test(arg))).toBe(true);
    }, 10000);

    it('puppeteer accept socks4a proxy', async () => {
        process.env.PROXY_PROTOCOL = 'socks4a';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        puppeteer = require('../../lib/utils/puppeteer');
        browser = await puppeteer();

        expect(browser.process().spawnargs.some((arg) => /^--proxy-server=socks4:\/\/rsshub.proxy:2333$/.test(arg))).toBe(true);
    }, 10000);

    it('puppeteer accept socks5h proxy', async () => {
        process.env.PROXY_PROTOCOL = 'socks5h';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        puppeteer = require('../../lib/utils/puppeteer');
        browser = await puppeteer();

        expect(browser.process().spawnargs.some((arg) => /^--proxy-server=socks5:\/\/rsshub.proxy:2333$/.test(arg))).toBe(true);
    }, 10000);
});

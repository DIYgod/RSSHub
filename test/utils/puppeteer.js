let puppeteer;
const wait = require('../../lib/utils/wait');
const cheerio = require('cheerio');

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

        expect((await browser.process()).signalCode).toBe(null);
        const sleepTime = 31 * 1000 - (Date.now() - startTime); // prevent long loading time from failing the test
        if (sleepTime > 0) {
            await wait(sleepTime);
        }
        expect((await browser.process()).signalCode).toBe('SIGKILL');
        browser = null;
    }, 45000);

    it('puppeteer without stealth', async () => {
        puppeteer = require('../../lib/utils/puppeteer');
        browser = await puppeteer({ stealth: false });
        const page = await browser.newPage();
        await page.goto('https://bot.sannysoft.com');

        const html = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(html);
        browser.close();
        browser = null;

        const webDriverTest = $('tbody tr').eq(2).find('td').eq(1).text().trim();
        const chromeTest = $('tbody tr').eq(4).find('td').eq(1).text().trim();
        // the website return empty string from time to time for no reason
        // since we don't really care whether puppeteer without stealth passes the bot test, just let it go
        expect(['present (failed)', '']).toContain(webDriverTest);
        expect(['missing (failed)', '']).toContain(chromeTest);
    }, 10000);

    it('puppeteer with stealth', async () => {
        puppeteer = require('../../lib/utils/puppeteer');
        browser = await puppeteer({ stealth: true });
        const page = await browser.newPage();
        await page.goto('https://bot.sannysoft.com');

        const html = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(html);
        browser.close();
        browser = null;

        const webDriverTest = $('tbody tr').eq(2).find('td').eq(1).text().trim();
        const chromeTest = $('tbody tr').eq(4).find('td').eq(1).text().trim();
        // these are something we really care about
        expect(webDriverTest).toBe('missing (passed)');
        expect(chromeTest).toBe('present (passed)');
    }, 10000);

    it('puppeteer accept proxy uri', async () => {
        process.env.PROXY_URI = 'http://user:pass@rsshub.proxy:2333';

        puppeteer = require('../../lib/utils/puppeteer');
        browser = await puppeteer();

        expect(browser.process().spawnargs.some((arg) => /^--proxy-server=http:\/\/.*$/.test(arg))).toBe(true);
    });

    it('puppeteer accept proxy', async () => {
        process.env.PROXY_PROTOCOL = 'http';
        process.env.PROXY_HOST = 'rsshub.proxy';
        process.env.PROXY_PORT = '2333';

        puppeteer = require('../../lib/utils/puppeteer');
        browser = await puppeteer();

        expect(browser.process().spawnargs.some((arg) => /^--proxy-server=http:\/\/.*$/.test(arg))).toBe(true);
    }, 10000);
});

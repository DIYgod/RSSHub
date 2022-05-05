let puppeteer;
const wait = require('../../lib/utils/wait');
const cheerio = require('cheerio');

afterEach(() => {
    jest.resetModules();
});

describe('puppeteer', () => {
    it('puppeteer run', async () => {
        puppeteer = require('../../lib/utils/puppeteer');
        const browser = await puppeteer();
        const page = await browser.newPage();
        await page.goto('https://www.google.com', {
            waitUntil: 'domcontentloaded',
        });

        // eslint-disable-next-line no-undef
        const html = await page.evaluate(() => document.body.innerHTML);
        expect(html.length).toBeGreaterThan(0);

        expect((await browser.process()).signalCode).toBe(null);
        await wait(31 * 1000);
        expect((await browser.process()).signalCode).toBe('SIGKILL');
    }, 40000);
    it('puppeteer without stealth', async () => {
        puppeteer = require('../../lib/utils/puppeteer');
        const browser = await puppeteer({ stealth: false });
        const page = await browser.newPage();
        await page.goto('https://bot.sannysoft.com', {
            waitUntil: 'networkidle0',
        });

        const html = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(html);
        browser.close();

        const webDriverTest = $('tbody tr').eq(2).find('td').eq(1).text().trim();
        const chromeTest = $('tbody tr').eq(4).find('td').eq(1).text().trim();
        expect(webDriverTest).toBe('present (failed)');
        expect(chromeTest).toBe('missing (failed)');
    }, 10000);
    it('puppeteer with stealth', async () => {
        puppeteer = require('../../lib/utils/puppeteer');
        const browser = await puppeteer({ stealth: true });
        const page = await browser.newPage();
        await page.goto('https://bot.sannysoft.com', {
            waitUntil: 'networkidle0',
        });

        const html = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(html);
        browser.close();
        const webDriverTest = $('tbody tr').eq(2).find('td').eq(1).text().trim();
        const chromeTest = $('tbody tr').eq(4).find('td').eq(1).text().trim();
        expect(webDriverTest).toBe('missing (passed)');
        expect(chromeTest).toBe('present (passed)');
    }, 10000);
});

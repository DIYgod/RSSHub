const puppeteer = require('../../lib/utils/puppeteer');

describe('puppeteer', () => {
    it('puppeteer run', async () => {
        const browser = await puppeteer();
        const page = await browser.newPage();
        await page.goto('https://github.com/DIYgod/RSSHub', {
            waitUntil: 'domcontentloaded',
        });

        // eslint-disable-next-line no-undef
        const html = await page.evaluate(() => document.body.innerHTML);
        expect(html.length).toBeGreaterThan(0);

        await browser.close();
    });
});

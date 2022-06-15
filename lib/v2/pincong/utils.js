const baseUrl = 'https://pincong.rocks';

const puppeteerGet = (url, cache) =>
    cache.tryGet(url, async () => {
        const browser = await require('@/utils/puppeteer')();
        const page = await browser.newPage();
        await page.goto(url);
        const html = await page.evaluate(() => document.documentElement.innerHTML);
        browser.close();
        return html;
    });

module.exports = {
    baseUrl,
    puppeteerGet,
};

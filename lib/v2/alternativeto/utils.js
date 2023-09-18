const baseURL = 'https://alternativeto.net';

const puppeteerGet = (url, cache) =>
    cache.tryGet(url, async () => {
        const browser = await require('@/utils/puppeteer')();
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            request.resourceType() === 'document' ? request.continue() : request.abort();
        });
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
        });
        const html = await page.evaluate(() => document.documentElement.innerHTML);
        browser.close();
        return html;
    });

module.exports = {
    baseURL,
    puppeteerGet,
};

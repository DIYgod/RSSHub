const path = require('path');
const { art } = require('@/utils/render');

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

const renderDesc = (title, authors, doi, img) =>
    art(path.join(__dirname, 'templates/description.art'), {
        title,
        authors,
        doi,
        img,
    });

module.exports = {
    puppeteerGet,
    renderDesc,
};

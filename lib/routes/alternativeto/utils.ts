import puppeteer from '@/utils/puppeteer';

const baseURL = 'https://alternativeto.net';

const puppeteerGet = (url, cache) =>
    cache.tryGet(url, async () => {
        const browser = await puppeteer();
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            request.resourceType() === 'document' ? request.continue() : request.abort();
        });
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
        });
        const html = await page.evaluate(() => document.documentElement.innerHTML);
        await browser.close();
        return html;
    });

export { baseURL, puppeteerGet };

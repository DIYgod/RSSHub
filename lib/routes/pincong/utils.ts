import playwright from '@/utils/playwright';

const baseUrl = 'https://pincong.rocks';

const playwrightGet = (url, cache) =>
    cache.tryGet(url, async () => {
        const browser = await playwright();
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

export { baseUrl, playwrightGet };

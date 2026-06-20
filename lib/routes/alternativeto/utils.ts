import playwright from '@/utils/playwright';

const baseURL = 'https://alternativeto.net';

const playwrightGet = (url, cache) =>
    cache.tryGet(url, async () => {
        const context = await playwright();
        const page = await context.newPage();
        await page.route('**/*', (route) => {
            const request = route.request();
            request.resourceType() === 'document' ? route.continue() : route.abort();
        });
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
        });
        const html = await page.evaluate(() => document.documentElement.innerHTML);
        await context.close();
        return html;
    });

export { baseURL, playwrightGet };

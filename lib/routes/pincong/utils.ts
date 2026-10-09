import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import playwright from '@/utils/playwright';

export const baseUrl = 'https://pincong.rocks';

const playwrightGet = async (url: string) => {
    const context = await playwright();
    const page = await context.newPage();
    await page.route('**/*', (route) => {
        const request = route.request();
        request.resourceType() === 'document' ? route.continue() : route.abort();
    });
    logger.http(`Requesting ${url}`);
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });
    const html = await page.evaluate(() => document.documentElement.getHTML());
    await context.close();
    return html;
};

export const get = (url: string, cache) =>
    cache.tryGet(url, async () => {
        try {
            return await ofetch<string>(url, { minVersion: 'TLSv1.3', retry: 0 });
        } catch {
            return playwrightGet(url);
        }
    });

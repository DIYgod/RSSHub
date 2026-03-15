import { getPuppeteerPage } from '@/utils/puppeteer';

const puppeteerGet = async (url) => {
    let data;
    const { destroy } = await getPuppeteerPage(url, {
        onBeforeLoad: async (page) => {
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' ? request.continue() : request.abort();
            });
            page.on('response', async (response) => {
                data = await (response.request().url().includes('/api/posts') ? response.json() : response.text());
            });
        },
    });
    await destroy();
    return data;
};

export { puppeteerGet };

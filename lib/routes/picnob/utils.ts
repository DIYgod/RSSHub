import { getPuppeteerPage } from '@/utils/puppeteer';

const puppeteerGet = async (url) => {
    let data;
    const { destory } = await getPuppeteerPage(url, {
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
    await destory();
    return data;
};

export { puppeteerGet };

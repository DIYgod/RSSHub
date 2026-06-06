import { getPlaywrightPage } from '@/utils/playwright';

const playwrightGet = async (url) => {
    let data;
    const { destroy } = await getPlaywrightPage(url, {
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => {
                const request = route.request();
                request.resourceType() === 'document' ? route.continue() : route.abort();
            });
            page.on('response', async (response) => {
                data = await (response.request().url().includes('/api/posts') ? response.json() : response.text());
            });
        },
    });
    await destroy();
    return data;
};

export { playwrightGet };

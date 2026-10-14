import type { APIRequestContext } from 'patchright';

import { getPlaywrightPage } from '@/utils/playwright';

export const getBjxPage = async (url: string) => {
    const instance = await getPlaywrightPage(url, {
        closeTimeout: 0,
        onBeforeLoad: async (page) => {
            await page.route('**/*', async (request) => {
                await (['document', 'script', 'xhr', 'fetch'].includes(request.request().resourceType()) ? request.continue() : request.abort());
            });
        },
    });
    try {
        await instance.page.waitForSelector('.cc-list-content li');
        return instance;
    } catch (error) {
        await instance.destroy();
        throw error;
    }
};

export const fetchBjxPage = async (url: string, context: APIRequestContext) => {
    const response = await context.get(url);
    if (!response.ok()) {
        throw new Error(`Unable to fetch the article (${response.status()}): ${url}`);
    }
    return await response.text();
};

import got from '@/utils/got';
import { getPlaywrightPage } from '@/utils/playwright';

async function getContent(url, pptr = false) {
    if (pptr) {
        const { page, destroy } = await getPlaywrightPage(url, {
            closeTimeout: 0,
            gotoConfig: { waitUntil: 'networkidle' },
            onBeforeLoad: async (page) => {
                await page.route('**/*', (route) => {
                    const type = route.request().resourceType();
                    return type === 'document' || type === 'script' ? route.continue() : route.abort();
                });
            },
        });
        try {
            return await page.content();
        } finally {
            await destroy();
        }
    }
    const response = await got(url);
    return response.data;
}

export { getContent };

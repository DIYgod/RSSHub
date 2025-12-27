import logger from '@/utils/logger';
import { getPuppeteerPage } from '@/utils/puppeteer';

const allowedResourceTypes = new Set(['document', 'script']);

const puppeteerGet = async (headers, link) => {
    logger.debug(`Requesting ${link}`);
    // logger.debug(`With headers: ${JSON.stringify(headers)}`);
    const { page, destory, browser } = await getPuppeteerPage(link, {
        onBeforeLoad: async (page) => {
            if (headers) {
                await page.setExtraHTTPHeaders(headers);
                await page.setUserAgent(headers['User-Agent']);
            }
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                allowedResourceTypes.has(request.resourceType()) ? request.continue() : request.abort();
            });
        },
        gotoConfig: { waitUntil: 'networkidle2' },
    });
    const cookies = await browser.cookies();
    const cookiesStr = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const response = await page.content();
    if (!response) {
        throw new Error(`Failed to fetch ${link}`);
    }
    destory();
    return { response, cookiesStr };
};

export { puppeteerGet };

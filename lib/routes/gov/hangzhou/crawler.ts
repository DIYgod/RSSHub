import logger from '@/utils/logger';

export async function zjzwfwCrawler(item: any, browser: any): Promise<string> {
    let page;
    try {
        page = await browser.newPage();
        await page.setRequestInterception(true);
        let response = '';
        try {
            const CHUNK_REGEX = /chunk-vendors\.[a-f0-9]+\.(js|css)/;

            const loadedResources = { css: false, js: false };
            page.on('request', (request) => {
                request.continue({
                    ...request.headers(),
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                });
            });
            page.on('response', (response) => {
                const url = response.url();
                if (CHUNK_REGEX.test(url) && response.status() === 200) {
                    if (url.endsWith('.css')) {
                        loadedResources.css = true;
                    }
                    if (url.endsWith('.js')) {
                        loadedResources.js = true;
                    }
                }
            });
            const resourcePromise = new Promise<void>((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error('CSS/JS resources timed out'));
                }, 29000);

                page.on('response', (response) => {
                    const url = response.url();
                    if (CHUNK_REGEX.test(url) && response.status() === 200) {
                        if (url.endsWith('.css')) {
                            loadedResources.css = true;
                        } else if (url.endsWith('.js')) {
                            loadedResources.js = true;
                        }
                        if (loadedResources.css && loadedResources.js) {
                            clearTimeout(timeoutId);
                            resolve();
                        }
                    }
                });
            });
            await Promise.all([
                page.goto(item.link, { waitUntil: 'networkidle0' }),
                // capture the targeted css/js resources even there is no active internet connection
                resourcePromise.catch((error) => {
                    logger.error('Resource loading error:', error);
                    throw error;
                }),
            ]);
            await page.locator('.item-left .item .title .button').click();
            response = await page.content();
        } catch (error) {
            logger.error('Page Error when visiting /gov/hangzhou/zwfw:', error);
        } finally {
            if (page && !page.isClosed()) {
                await page.close();
            }
        }
        return response || '';
    } catch (error) {
        logger.error('Error when visiting /gov/hangzhou/zwfw:', error);
        return '';
    }
}

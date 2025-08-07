import puppeteer from '@/utils/puppeteer';

const puppeteerGet = async (url: string, cache: any) =>
    await cache.tryGet(url, async () => {
        const browser = await puppeteer();
        const page = await browser.newPage();

        // Set user agent to bypass basic bot detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Set request interception to optimize loading
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            // Allow documents, scripts, and stylesheets, block images and other resources
            const resourceType = request.resourceType();
            if (['document', 'script', 'stylesheet'].includes(resourceType)) {
                request.continue();
            } else {
                request.abort();
            }
        });

        try {
            await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 30000,
            });

            // Wait for main content wrapper
            try {
                await page.waitForSelector('main-wrap', {
                    timeout: 10000,
                });
            } catch {
                // Continue even if selector not found
            }

            const html = await page.content();
            await page.close();
            await browser.close();

            return html;
        } catch (error) {
            await page.close();
            await browser.close();
            throw error;
        }
    });

export { puppeteerGet };

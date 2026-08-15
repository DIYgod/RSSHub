import type { BrowserContext } from 'patchright';

import { setCookies } from '@/utils/playwright-utils';

interface PlaywrightGetOptions {
    cookie?: string;
    timeout?: number;
    userAgent?: string;
}

const playwrightGet = async (url: string, context: BrowserContext, waitForSelector = '.t_f', options: PlaywrightGetOptions = {}) => {
    const page = await context.newPage();
    const expectResourceTypes = new Set(['document', 'script']);
    try {
        if (options.userAgent) {
            await page.setExtraHTTPHeaders({ 'User-Agent': options.userAgent });
        }

        if (options.cookie) {
            await setCookies(page, options.cookie, 'xsijishe.com');
        }

        await page.route('**/*', (route) => {
            const request = route.request();
            expectResourceTypes.has(request.resourceType()) ? route.continue() : route.abort();
        });
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
        });

        let html = await page.evaluate(() => document.documentElement.getHTML());
        if (html.includes('抱歉，您尚未登录，没有权限访问该版块')) {
            return html;
        }

        try {
            await page.waitForSelector(waitForSelector, { timeout: options.timeout ?? 10000 });
        } catch {
            // Return the loaded HTML even when the expected selector is missing.
        }

        html = await page.evaluate(() => document.documentElement.getHTML());
        return html;
    } finally {
        await page.close();
    }
};

export { playwrightGet };

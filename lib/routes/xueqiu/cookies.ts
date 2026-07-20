import { config } from '@/config';
import cache from '@/utils/cache';
import playwright from '@/utils/playwright';
import { getCookies } from '@/utils/playwright-utils';

export const parseToken = (link: string) =>
    cache.tryGet(
        'xueqiu:token',
        async () => {
            const context = await playwright();
            const page = await context.newPage();
            await page.route('**/*', (route) => {
                const request = route.request();
                const type = request.resourceType();
                type === 'document' || type === 'script' ? route.continue() : route.abort();
            });
            await page.goto(link, {
                waitUntil: 'domcontentloaded',
            });
            await page.evaluate(() => document.documentElement.getHTML());
            const cookies = await getCookies(page);
            return cookies;
        },
        config.cache.routeExpire,
        false
    );

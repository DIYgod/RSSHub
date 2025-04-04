import cache from '@/utils/cache';
import { config } from '@/config';
import puppeteer from '@/utils/puppeteer';

export const parseToken = (link: string) =>
    cache.tryGet(
        'xueqiu:token',
        async () => {
            const browser = await puppeteer({ stealth: true });
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' ? request.continue() : request.abort();
            });
            await page.goto(link, {
                waitUntil: 'domcontentloaded',
            });
            await page.evaluate(() => document.documentElement.innerHTML);
            const cookies = await page.cookies();
            await browser.close();
            return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
        },
        config.cache.routeExpire,
        false
    );

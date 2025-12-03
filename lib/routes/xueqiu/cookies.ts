import { config } from '@/config';
import cache from '@/utils/cache';
import puppeteer from '@/utils/puppeteer';
import { getCookies } from '@/utils/puppeteer-utils';

export const parseToken = (link: string) =>
    cache.tryGet(
        'xueqiu:token',
        async () => {
            const browser = await puppeteer();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' ? request.continue() : request.abort();
            });
            await page.goto(link, {
                waitUntil: 'domcontentloaded',
            });
            await page.evaluate(() => document.documentElement.innerHTML);
            const cookies = await getCookies(page);
            return cookies;
        },
        config.cache.routeExpire,
        false
    );

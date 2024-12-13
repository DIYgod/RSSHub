import cache from '@/utils/cache';
import { config } from '@/config';
import puppeteer from '@/utils/puppeteer';
import { getCookies, setCookies } from '@/utils/puppeteer-utils';

export const parseToken = (link: string) =>
    cache.tryGet(
        'xueqiu:token',
        async () => {
            const page = await getPage(link, null);
            await page.evaluate(() => document.documentElement.innerHTML);
            const cookies = await getCookies(page);

            return cookies;
        },
        config.cache.routeExpire,
        false
    );

export const getPage = async (url: string, cookie: string | Record<string, any> | null = null) => {
    const browser = await puppeteer({ stealth: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });

    if (cookie) {
        await setCookies(page, cookie, 'xueqiu.com');
    }
    return page;
};

export const getJson = async (url: string, cookie: string | Record<string, any> | null = null) => {
    const page = await getPage(url, cookie);

    const data = await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });
    const res = await data?.json();
    return res;
};

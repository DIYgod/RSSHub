import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { getToken, sign } from './utils';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import puppeteer from '@/utils/puppeteer';
import logger from '@/utils/logger';

export const route: Route = {
    path: '/index/recommend',
    categories: ['programming'],
    example: '/51cto/index/recommend',
    radar: [
        {
            source: ['51cto.com/'],
        },
    ],
    name: '推荐',
    maintainers: ['cnkmmk'],
    handler,
    url: '51cto.com/',
};

async function get_fullcontent(item, browser) {
    let fullContent: null | string = null;
    const articleResponse = await puppeteer_get(item.url, browser);
    const $ = load(articleResponse);
    fullContent = item.url.includes('ost.51cto.com') ? $('.posts-content').html() : $('article').html();

    return {
        title: item.title,
        link: item.url,
        pubDate: parseDate(item.pubdate, +8),
        description: fullContent || item.abstract + '(RSSHub: Failed to get fullContent)', // Return item.abstract if fullContent is null
    };
}

async function puppeteer_get(link, browser) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    logger.http(`Requesting ${link}`);
    // You have to request the page twice. I guess it's setting cookies when you request for the first time.
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    page.close();
    return response;
}

async function handler(ctx) {
    const url = 'https://api-media.51cto.com';
    const requestPath = 'index/index/recommend';
    const token = (await getToken()) as string;
    const timestamp = Date.now();
    const params = {
        page: 1,
        page_size: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50,
        limit_time: 0,
        name_en: '',
    };

    // 导入 puppeteer 工具类并初始化浏览器实例
    const browser = await puppeteer();

    const response = await got(`${url}/${requestPath}`, {
        searchParams: {
            ...params,
            timestamp,
            token,
            sign: sign(requestPath, params, timestamp, token),
        },
    });
    const list = response.data.data.data.list;

    const items = await Promise.all(list.map((item) => cache.tryGet(item.url, () => get_fullcontent(item, browser))));

    browser.close();
    return {
        title: '51CTO',
        link: 'https://www.51cto.com/',
        description: '51cto - 推荐',
        item: items,
    };
}

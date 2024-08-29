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

async function init_page(browser) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    // Load for setting up cookies
    await page.goto('https://www.51cto.com/', {
        waitUntil: 'domcontentloaded',
    });
    return page;
}

async function puppeteer_get(link, page) {
    logger.http(`Requesting ${link}`);
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();

    return response;
}

async function get_fullcontent(item, page) {
    let fullContent: null | string = null;
    const articleResponse = await puppeteer_get(item.url, page);
    const $ = load(articleResponse);
    fullContent = item.url.includes('ost.51cto.com') ? $('.posts-content').html() : $('article').html();

    return {
        title: item.title,
        link: item.url,
        pubDate: parseDate(item.pubdate, +8),
        description: fullContent || item.abstract + '(RSSHub: Failed to get fullContent)', // Return item.abstract if fullContent is null
    };
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

    const response = await got(`${url}/${requestPath}`, {
        searchParams: {
            ...params,
            timestamp,
            token,
            sign: sign(requestPath, params, timestamp, token),
        },
    });
    const list = response.data.data.data.list;

    const browser = await puppeteer();
    // let page = await init_page(browser);
    // Create a list that includes 5 pages
    const numPages = 50;
    const pages = Array.from({ length: numPages }, () => init_page(browser));
    let n = 0;

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.url, async () => {
                n++;
                return get_fullcontent(item, await pages[n % numPages]);
            })
        )
    );

    browser.close();
    return {
        title: '51CTO',
        link: 'https://www.51cto.com/',
        description: '51cto - 推荐',
        item: items,
    };
}

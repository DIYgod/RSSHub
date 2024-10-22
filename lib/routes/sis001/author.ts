import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { baseUrl, getThread } from './common';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/author/:id?',
    categories: ['bbs'],
    example: '/sis001/author/13131575',
    parameters: { id: '作者 ID，可以在作者的个人空间地址找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '作者',
    maintainers: ['keocheung'],
    handler,
};

async function handler(ctx) {
    const { id = '13131575' } = ctx.req.param();
    const url = `${baseUrl}/forum/space.php?uid=${id}`;

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    page.close();
    const $ = load(response);

    const username = $('div.bg div.title').text().replace('的个人空间', '');

    let items = $('div.center_subject ul li a[href^=thread]')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${baseUrl}/forum/${item.attr('href')}`,
                author: username,
            };
        });

    items = await Promise.all(items.map((item) => cache.tryGet(item.link, async () => await getThread(browser, item))));

    browser.close();

    return {
        title: `${username}的主题`,
        link: url,
        item: items,
    };
}

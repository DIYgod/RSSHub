import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import type { Context } from 'hono';
import { defaultBaseUrl, getCookie, getThread } from './common';

export const route: Route = {
    path: '/forum/:id?',
    categories: ['bbs'],
    example: '/sis001/forum/322',
    parameters: { id: '子版块 ID，可在子论坛 URL 找到，默认为 `Funny Jokes | 短篇笑话区`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '子版块',
    maintainers: [],
    handler,
};

async function handler(ctx: Context) {
    const { id = 76 } = ctx.req.param();
    let baseUrl = ctx.req.query('baseUrl');
    if (!baseUrl) {
        baseUrl = defaultBaseUrl;
    }
    const url = `${baseUrl}/forum/forum-${id}-1.html`;

    let response = await got(url);
    const cookie = getCookie(response.data);
    response = await got(url, { headers: { cookie } });
    const $ = load(response.data);

    let items = $('form table')
        .last()
        .find('tbody')
        .toArray()
        .slice(1) // skip first empty row
        .map((item) => {
            item = $(item);
            return {
                title: item.find('th em').text() + ' ' + item.find('span a').eq(0).text(),
                link: new URL(item.find('span a').eq(0).attr('href'), `${baseUrl}/forum/`).href,
                author: item.find('.author a').text(),
            };
        });

    items = await Promise.all(items.map((item) => cache.tryGet(item.link, async () => await getThread(cookie, item))));

    return {
        title: $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        link: url,
        item: items,
    };
}

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { ossUrl, ProcessFeed, rootUrl } from './utils';

export const route: Route = {
    path: '/column/:id',
    categories: ['reading'],
    example: '/aisixiang/column/722',
    parameters: { id: '栏目 ID, 可在对应栏目 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '栏目',
    maintainers: ['HenryQW', 'nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const currentUrl = new URL(`/data/search?column=${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const title = $('div.article-title a').first().text().replaceAll('[]', '');

    const items = $('div.article-title')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a[title]');

            return {
                title: a.text(),
                link: new URL(a.prop('href'), rootUrl).href,
                author: a.text().split('：')[0],
                pubDate: timezone(parseDate(item.find('span').text()), +8),
            };
        });

    return {
        item: await ProcessFeed(limit, cache.tryGet, items),
        title: `爱思想 - ${title}`,
        link: currentUrl,
        description: $('div.tips').text(),
        language: 'zh-cn',
        image: new URL('images/logo.jpg', ossUrl).href,
        subtitle: title,
    };
}

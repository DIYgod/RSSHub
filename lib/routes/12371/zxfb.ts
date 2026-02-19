import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const handler = async (ctx) => {
    const { category = 'zxfb' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const rootUrl = 'https://www.12371.cn/';
    const currentUrl = `${rootUrl}${category}/`;
    const response = await got(currentUrl);

    const $ = cheerio.load(response.data);

    const pattern = /item=(\[{.*?}]);/;
    const newsList = JSON.parse($('script[language="javascript"]').text().match(pattern)?.[1].replaceAll("'", '"') || '[]');

    const topNewsList = newsList.slice(0, limit).map((item) => ({
        title: item.title,
        pubDate: timezone(parseDate(item.brief, 'YYYY-MM-DD HH:mm:ss'), 8),
        link: item.link_add,
    }));

    const items = await Promise.all(
        topNewsList.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = cheerio.load(detailResponse.data);

                item.description = $('.word').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/:category?',
    example: '/12371/zxfb',
    parameters: { category: '新闻分类名，预设 `zxfb`' },
    radar: [
        {
            source: ['www.12371.cn/:category'],
        },
    ],
    name: '最新发布',
    maintainers: ['zvrr'],
    handler,
    url: 'www.12371.cn',
    description: `| 最新发布 |
| :------: |
|   zxfb   |`,
};

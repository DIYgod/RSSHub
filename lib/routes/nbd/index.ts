import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';
import { isOnSite } from '@/utils/valid-host';

export const route: Route = {
    path: '/:id?',
    categories: ['finance'],
    example: '/nbd',
    parameters: { id: '分类 id，见下表，默认为要闻' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['nbd.com.cn/', 'nbd.com.cn/columns/:id?'],
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    url: 'nbd.com.cn/',
    description: `| 头条 | 要闻 | 图片新闻 | 推荐 |
| ---- | ---- | -------- | ---- |
| 2    | 3    | 4        | 5    |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '3';

    const rootUrl = 'https://www.nbd.com.cn';
    const currentUrl = `${rootUrl}/columns/${id}/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.u-news-title a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: $item.attr('href'),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            // only follow links on the site itself
            if (!isOnSite(item.link, 'nbd.com.cn')) {
                return item;
            }
            const detail = await cache.tryGet(`nbd:article:v3:${item.link}`, async () => {
                const detailResponse = await ofetch.raw(item.link!, { responseType: 'text' });
                if (!detailResponse.url.startsWith(`${rootUrl}/`)) {
                    return {};
                }
                const detailBody = detailResponse._data ?? '';
                const content = load(detailBody);
                const publishedAt = detailBody.match(/"pubDate": "(.*)"/)?.[1];

                return {
                    description: content('.g-articl-text').html(),
                    pubDate: publishedAt ? parseDate(publishedAt, 8) : undefined,
                };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: `${$('h1').text() || $('.u-channelname').text()} - 每经网`,
        link: currentUrl,
        item: items,
    };
}

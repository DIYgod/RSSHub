import { load } from 'cheerio';
import iconv from 'iconv-lite';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/blog/:type?/:time?/:sort?',
    categories: ['new-media'],
    example: '/sciencenet/blog',
    parameters: { type: '类型，见下表，默认为推荐', time: '时间，见下表，默认为所有时间', sort: '排序，见下表，默认为按发表时间排序' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '精选博客',
    maintainers: ['nczitzk'],
    handler,
    description: `类型

| 精选      | 最新 | 热门 |
| --------- | ---- | ---- |
| recommend | new  | hot  |

时间

| 36 小时内精选博文 | 一周内精选博文 | 一月内精选博文 | 半年内精选博文 | 所有时间精选博文 |
| ----------------- | -------------- | -------------- | -------------- | ---------------- |
| 1                 | 2              | 3              | 4              | 5                |

排序

| 按发表时间排序 | 按评论数排序 | 按点击数排序 |
| -------------- | ------------ | ------------ |
| 1              | 2            | 3            |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'recommend';
    const time = ctx.req.param('time') ?? '5';
    const sort = ctx.req.param('sort') ?? '1';
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 50;

    const rootUrl = 'http://blog.sciencenet.cn';
    const currentUrl = `${rootUrl}/blog.php?mod=${type}&type=list&op=${time}&ord=${sort}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response.data, 'gbk'));

    let items = $('tr td a[title]')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: `${rootUrl}/${$item.attr('href')}`,
                pubDate: new Date($item.next().text()).toUTCString(),
            };
        });

    // Bound simultaneous downloads and decoding of potentially large GBK pages.
    items = await pMap(
        items,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`sciencenet:article:v2:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                });

                const content = load(iconv.decode(detailResponse.data, 'gbk'));

                return { author: content('.xs2').text(), description: content('#blog_article').html(), pubDate: timezone(parseDate(content('.xg1').eq(5).text()), 8) };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: '科学网 - 精选博文',
        link: currentUrl,
        item: items,
    };
}

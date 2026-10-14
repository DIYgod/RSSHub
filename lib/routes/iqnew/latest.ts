import { load } from 'cheerio';
import iconv from 'iconv-lite';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/latest',
    categories: ['other'],
    example: '/iqnew/latest',
    parameters: {},
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
            source: ['iqnew.com/post/new_100/', 'iqnew.com/'],
        },
    ],
    name: '最近更新',
    maintainers: ['nczitzk'],
    handler,
    url: 'iqnew.com/post/new_100/',
};

async function handler(ctx) {
    const rootUrl = 'https://www.iqnew.com';
    const url = rootUrl + '/post/new_100/';
    const response = await got({
        method: 'get',
        url,
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response.data, 'gb2312'));
    const list = $('.page-main-list .list-item a')
        .slice(0, ctx.req.query('sorted') === 'false' ? getRouteLimit(ctx, 50) : Math.max(50, getRouteLimit(ctx, 50)))
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const href = $item.attr('href');
            if (!href) {
                throw new Error('IQnew did not provide an article link.');
            }

            return {
                link: new URL(href, url).href,
                title: '',
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                });

                const content = load(iconv.decode(detailResponse.data, 'gb2312'));

                item.title = content('.main-article .title').text();
                const date = content('.time').eq(0).text();
                item.pubDate = date ? timezone(parseDate(date), 8) : undefined;
                item.description = content('.content-intro').html();
                item.author = content('.author a').text();
                item.category = content('.keyword > a')
                    .toArray()
                    .map((item) => $(item).text());

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: '爱Q生活网 - 最近更新',
        link: url,
        item: items,
    };
}

import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/sakurazaka46/news',
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
            source: ['sakurazaka46.com/s/s46/news/list', 'sakurazaka46.com/'],
        },
    ],
    name: '新闻',
    maintainers: ['nczitzk'],
    handler,
    url: 'sakurazaka46.com/s/s46/news/list',
};

async function handler(ctx) {
    const rootUrl = 'https://sakurazaka46.com';
    const currentUrl = `${rootUrl}/s/s46/news/list`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.com-news-part .box a')
        .slice(0, getRouteLimit(ctx, 30))
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const date = $item.find('.date').text();

            return {
                title: $item.find('.lead').text(),
                link: `${rootUrl}${$item.attr('href')!.split('?', 1)[0]}`,
                pubDate: date ? parseDate(`${date.replaceAll('.', '-')}T00:00:00Z`) : undefined,
            };
        });

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.article').html();

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}

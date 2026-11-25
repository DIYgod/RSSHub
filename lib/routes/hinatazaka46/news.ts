import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/hinatazaka46/news',
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
            source: ['hinatazaka46.com/s/official/news/list', 'hinatazaka46.com/'],
        },
    ],
    name: '新闻',
    maintainers: ['crispgm', 'AkashiGakki'],
    handler,
    url: 'hinatazaka46.com/s/official/news/list',
};

async function handler(ctx) {
    const rootUrl = 'https://www.hinatazaka46.com';
    const currentUrl = `${rootUrl}/s/official/news/list`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const limit = getRouteLimit(ctx, 30);
    let items = $('.p-news__list .p-news__item a')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);

            return {
                title: $item.find('.c-news__text').text(),
                link: `${rootUrl}${$item.attr('href')!.split('?', 1)[0]}`,
                pubDate: parseDate($item.find('.c-news__date').text(), 'YYYY.MM.DD', 9),
            };
        });

    items = await pMap(
        items,
        async (item: (typeof items)[number]) => ({
            ...item,
            ...(await cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const description = content('.p-article__text').html();

                return { description };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        language: 'ja' as const,
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}

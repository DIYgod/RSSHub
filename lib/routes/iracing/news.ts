import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/iracing/news',
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
            source: ['www.iracing.com/category/news/sim-racing-news'],
            target: '/news',
        },
    ],
    name: 'News',
    maintainers: ['canonnizq'],

    handler: async () => {
        const url = 'https://www.iracing.com/category/news/sim-racing-news/';

        const response = await ofetch(url);
        const $ = load(response);

        const links = $('#page .clearfix h2 a')
            .toArray()
            .map((item) => $(item).attr('href')!);

        const items = await Promise.all(
            links.map((link) =>
                cache.tryGet(link, async () => {
                    const response = await ofetch(link);
                    const $ = load(response);

                    return {
                        title: $('h1 a').text(),
                        link,
                        author: $('.page-header a[rel="author"]').text(),
                        pubDate: parseDate($('.page-header small').text().trim().split(' by', 1)[0], 'MMMM D, YYYY'),
                        itunes_item_image: $('#page img').first().attr('src'),
                        content: {
                            html: $('#page > div > p')
                                .toArray()
                                .map((x) => $(x).prop('outerHTML'))
                                .join(''),
                        },
                    };
                })
            )
        );

        return {
            title: 'iRacing News',
            link: url,
            item: items,
        };
    },
};

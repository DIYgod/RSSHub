import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

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

        const response = await ofetch(url.replace('https:', 'http:'));
        const feed = await parser.parseString(await ofetch(`${url}feed/`, { responseType: 'text' }));
        const $ = load(response);

        const links = $('#page .clearfix h2 a')
            .toArray()
            .map((item) => $(item).attr('href')!);

        const items = await pMap(
            links,
            (link) =>
                cache.tryGet(link, async () => {
                    const entry = feed.items.find((item) => item.link === link);
                    if (entry?.title) {
                        const html = entry['content:encoded'] ?? entry.content;
                        const content = load(html ?? '');
                        const date = entry.isoDate ?? entry.pubDate;
                        return {
                            title: entry.title,
                            link,
                            author: entry.creator ?? entry.author,
                            pubDate: date ? parseDate(date) : undefined,
                            category: entry.categories,
                            itunes_item_image: content('img').first().attr('src'),
                            content: { html },
                        };
                    }
                    const response = await ofetch(link);
                    const $ = load(response);

                    return {
                        title: $('h1 a').text(),
                        link,
                        author: $('.page-header a[rel="author"]').text(),
                        pubDate: parseDate($('.page-header small').text().trim().split(' by', 1)[0], 'MMMM D, YYYY'),
                        itunes_item_image: $('#page img').attr('src'),
                        content: {
                            html: $('#page > div > p')
                                .toArray()
                                .map((x) => $(x).prop('outerHTML'))
                                .join(''),
                        },
                    };
                }),
            { concurrency: 3 }
        );

        return {
            title: 'iRacing News',
            link: url,
            item: items,
        };
    },
};

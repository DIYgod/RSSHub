import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const rootUrl = 'https://fuliba2023.net';

export const route: Route = {
    path: '/latest',
    categories: ['new-media'],
    example: '/fuliba/latest',
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
            source: ['fuliba2023.net/'],
        },
    ],
    name: '最新',
    maintainers: ['shinemoon'],
    handler,
    url: 'fuliba2023.net/',
};

async function handler(ctx) {
    // The WordPress REST API now answers 410 Gone, so read the latest posts from the home page
    const response = await ofetch(rootUrl);
    const $ = load(response);

    const list = $('article.excerpt')
        .slice(0, getRouteLimit(ctx, 20))
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const link = $item.find('header h2 a');
            return {
                title: link.attr('title') || link.text(),
                link: new URL(link.attr('href')!, rootUrl).href,
                pubDate: timezone(parseDate($item.find('.meta time').text()), 8),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);
                item.description = content('article.article-content').html() ?? undefined;
                return item;
            }),
        { concurrency: 5 }
    );

    return {
        title: '福利吧',
        link: rootUrl,
        item: items,
    };
}

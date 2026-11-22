import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

import { baseUrl, cookieJar, getArticle } from './utils';

export const route: Route = {
    path: '/news',
    categories: ['journal'],
    example: '/nature/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    radar: [
        {
            source: ['nature.com/latest-news', 'nature.com/news', 'nature.com/'],
        },
    ],
    name: 'News',
    maintainers: ['y9c', 'TonyRL'],
    handler,
    url: 'nature.com/latest-news',
};

async function handler() {
    const url = `${baseUrl}/latest-news`;
    const res = await got(url, { cookieJar });
    const $ = load(res.data);

    let items: DataItem[] = $('.c-article-item__content')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('h3').text(),
                link: baseUrl + $item.find('a').attr('href'),
                pubDate: parseDate($item.find('.c-article-item__date').text(), 0),
            };
        });

    items = await pMap(items, getArticle, { concurrency: 3 });

    return {
        title: 'Nature | Latest News',
        description: $('meta[name=description]').attr('content'),
        link: url,
        item: items,
    };
}

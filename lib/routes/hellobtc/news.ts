import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const rootUrl = 'https://www.hellobtc.com';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/hellobtc/news',
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
            source: ['hellobtc.com/news'],
        },
    ],
    name: '快讯',
    maintainers: ['Fatpandac'],
    handler,
    url: 'hellobtc.com/news',
};

async function handler() {
    const url = `${rootUrl}/news`;

    const response = await got(url);
    const $ = load(response.data);
    const items = $('nav.js-nav')
        .find('div.item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const link = $item.find('a').attr('href');
            const date = $item.find('span.date').text();
            const year = link ? new URL(link, rootUrl).pathname.match(/^\/news\/(\d{4})\d{2}\//)?.[1] : undefined;
            return {
                title: $(item).find('h2').text(),
                link,
                description: $(item).find('div.sub').text(),
                pubDate: date && year ? parseDateInTimezone(`${year}-${date}`, 8) : undefined,
            };
        })
        .filter((item) => item.title && item.link);

    return {
        title: '白话区块链 - 快讯',
        link: url,
        item: items,
    };
}

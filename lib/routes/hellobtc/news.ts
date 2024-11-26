import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.hellobtc.com';

export const route: Route = {
    path: '/news',
    categories: ['new-media', 'popular'],
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
        .map((_, item) => ({
            title: $(item).find('h2').text(),
            link: $(item).find('a').attr('href'),
            description: $(item).find('div.sub').text(),
            pubDate: timezone(parseDate($(item).find('span.date').text(), 'MM-DD HH:mm'), +8),
        }))
        .filter(Boolean)
        .get();

    return {
        title: `白话区块链 - 快讯`,
        link: url,
        item: items,
    };
}

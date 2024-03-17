import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { parseArticle } from './utils';

export const route: Route = {
    path: '/news/',
    categories: ['game'],
    example: '/tgbus/news/',
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
            source: ['www.tgbus.com/list/news/'],
            target: '/news/',
        },
    ],
    name: '首页要闻',
    maintainers: ['Xzonn'],
    handler,
};

async function handler() {
    const url = 'https://www.tgbus.com/list/news/';
    const res = await got(url);
    const $ = load(res.data as unknown as string);
    const list = $('div.special-infocard')
        .toArray()
        .map((item) => {
            const element = $(item);
            const a = element.find('a');
            return {
                title: element.find('div.title').text(),
                link: `https://www.tgbus.com${a.attr('href')}`,
                description: element.find('div.title').text(),
                pubDate: timezone(parseDate(element.find('div.info span:nth-child(3)').text().trim()), 8),
            };
        });

    const out = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    return {
        title: '电玩巴士首页要闻',
        description: $('meta[name="description"]').attr('content'),
        link: url,
        item: out,
    };
}

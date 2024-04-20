import { Route } from '@/types';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/military',
    categories: ['new-media'],
    example: '/china/news/military',
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
            source: ['military.china.com/news'],
        },
    ],
    name: 'Military - Military News 军事 - 军事新闻',
    maintainers: ['jiaaoMario'],
    handler,
    url: 'military.china.com/news',
};

async function handler() {
    const websiteUrl = 'https://military.china.com/news/';
    const response = await got(websiteUrl);
    const data = response.data;
    const $ = load(data);
    const commonList = $('.item_list li');
    return {
        title: '中华网-军事新闻',
        link: 'https://military.china.com/news/',
        item:
            commonList &&
            commonList
                .map((_, item) => {
                    item = $(item);
                    return {
                        title: item.find('h3.item_title').text(),
                        author: '中华网军事',
                        category: '中华网军事',
                        pubDate: parseDate(item.find('em.item_time').text()),
                        description: item.find('.item_source').text(),
                        link: item.find('h3.item_title a').attr('href'),
                    };
                })
                .get(),
    };
}

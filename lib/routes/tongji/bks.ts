import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/bks',
    categories: ['university'],
    example: '/tongji/bks',
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
            source: ['bksy.tongji.edu.cn/'],
        },
    ],
    name: '本科生院通知公告',
    maintainers: ['shiquda'],
    handler,
    url: 'bksy.tongji.edu.cn/',
};

async function handler() {
    const link = 'https://bksy.tongji.edu.cn/30359/list.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.wcts-a0018 li');

    return {
        title: '同济大学本科生院',
        link,
        description: '同济大学本科生院通知公告',
        item: list?.toArray().map((item) => {
            item = $(item);
            const a = item.find('a');
            const dateItem = item.find('.li-data');
            const yearAndMonth = dateItem.find('span').text().split('-');
            const day = dateItem.find('p').text();
            const date = `${yearAndMonth[0]}-${yearAndMonth[1]}-${day}`;
            return {
                title: item.find('.li-tt-title').text(),
                description: item.find('.intro').text(),
                link: new URL(a.attr('href'), link).href,
                pubDate: parseDate(date, 'YYYY-MM-DD'),
            };
        }),
    };
}

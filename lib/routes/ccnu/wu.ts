import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/wu',
    categories: ['university'],
    example: '/ccnu/wu',
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
            source: ['uowji.ccnu.edu.cn/xwzx/tzgg.htm', 'uowji.ccnu.edu.cn/'],
        },
    ],
    name: '伍论贡学院',
    maintainers: ['shengmaosu'],
    handler,
    url: 'uowji.ccnu.edu.cn/xwzx/tzgg.htm',
};

async function handler() {
    const link = 'http://uowji.ccnu.edu.cn/tzgg.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.zy-mainxrx li');

    return {
        title: '华中师范大学伍论贡学院',
        link,
        description: '华中师范大学伍论贡学院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(item.find('small').text(), 'YYYY-MM-DD'),
                };
            }),
    };
}

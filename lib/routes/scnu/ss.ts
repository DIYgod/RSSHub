import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/ss',
    categories: ['university'],
    example: '/scnu/ss',
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
            source: ['ss.scnu.edu.cn/tongzhigonggao', 'ss.scnu.edu.cn/'],
        },
    ],
    name: '软件学院通知公告',
    maintainers: ['shengmaosu'],
    handler,
    url: 'ss.scnu.edu.cn/tongzhigonggao',
};

async function handler() {
    const link = 'http://ss.scnu.edu.cn/tongzhigonggao/';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.listshow li a');

    return {
        title: '华南师范大学软件学院',
        link,
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item
                        .contents()
                        .filter((_, node) => node.type === 'text')
                        .text(),
                    link: item.attr('href'),
                    pubDate: parseDate(item.find('.time').text()),
                };
            }),
    };
}

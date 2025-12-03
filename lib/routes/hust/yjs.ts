import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/hust/yjs',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['gszs.hust.edu.cn/zsxx/ggtz.htm', 'gszs.hust.edu.cn/'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['shengmaosu'],
    handler,
    url: 'gszs.hust.edu.cn/zsxx/ggtz.htm',
};

async function handler() {
    const link = 'https://gszs.hust.edu.cn/zsxx/ggtz.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.main_conRCb li');

    return {
        title: '华中科技大学研究生院',
        link,
        description: '华中科技大学研究生调剂信息',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(item.find('span').text(), 'YYYY-MM-DD'),
                };
            }),
    };
}

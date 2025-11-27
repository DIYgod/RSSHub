import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/gzhu/yjs',
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
            source: ['yjsy.gzhu.edu.cn/zsxx/zsdt/zsdt.htm', 'yjsy.gzhu.edu.cn/'],
        },
    ],
    name: '研究生院招生动态',
    maintainers: ['shengmaosu'],
    handler,
    url: 'yjsy.gzhu.edu.cn/zsxx/zsdt/zsdt.htm',
};

async function handler() {
    const link = 'https://yjsy.gzhu.edu.cn/zsxx/zsdt/zsdt.htm';
    const response = await got(link, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = load(response.data);
    const list = $('.picnews_cont li');

    return {
        title: '广州大学研究生院',
        link,
        description: '广州大学研招网通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('span a');
                return {
                    title: a.attr('title'),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(a.text(), 'YYYY-MM-DD'),
                };
            }),
    };
}

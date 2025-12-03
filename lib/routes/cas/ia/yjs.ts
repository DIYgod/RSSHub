import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/ia/yjs',
    categories: ['university'],
    example: '/cas/ia/yjs',
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
            source: ['www.ia.cas.cn/yjsjy/zs/sszs', 'www.ia.cas.cn/'],
        },
    ],
    name: '自动化所',
    maintainers: ['shengmaosu'],
    handler,
    url: 'www.ia.cas.cn/yjsjy/zs/sszs',
};

async function handler() {
    const link = 'http://www.ia.cas.cn/yjsjy/zs/sszs/';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.col-md-9 li');

    return {
        title: '中科院自动化所',
        link,
        description: '中科院自动化所通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item.find('li a').text(),
                    description: item.find('li a').text(),
                    link: item.find('li a').attr('href'),
                };
            }),
    };
}

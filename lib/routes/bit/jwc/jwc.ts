import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import util from './utils';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/bit/jwc',
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
            source: ['jwb.bit.edu.cn/tzgg/index.htm', 'jwb.bit.edu.cn/'],
        },
        {
            source: ['jwc.bit.edu.cn/'],
        },
    ],
    name: '教务处通知',
    maintainers: ['sinofp'],
    handler,
    url: 'jwb.bit.edu.cn/tzgg/index.htm',
};

async function handler() {
    const link = 'https://jwb.bit.edu.cn/tzgg/index.htm';
    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = load(response.data);
    const list = $('.notice > ul > li').toArray();

    const result = await util.processFeed(list, cache);

    return {
        title: $('title').text(),
        link,
        description: '北京理工大学教务部',
        item: result,
    };
}

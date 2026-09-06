import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import util from './utils';

export const route: Route = {
    path: '/cs',
    categories: ['university'],
    example: '/bit/cs',
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
            source: ['cs.bit.edu.cn/tzgg', 'cs.bit.edu.cn/'],
        },
    ],
    name: '计院通知',
    maintainers: ['sinofp'],
    handler,
    url: 'cs.bit.edu.cn/tzgg',
};

async function handler() {
    const link = 'https://cs.bit.edu.cn/tzgg/';
    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = load(response.data);

    const list = $('.box_list01 li').toArray();

    const result = await util.ProcessFeed(list, cache);

    return {
        title: $('title').text(),
        link,
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
}

import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
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
            source: ['jwc.bit.edu.cn/tzgg', 'jwc.bit.edu.cn/'],
        },
    ],
    name: '教务处通知',
    maintainers: ['sinofp'],
    handler,
    url: 'jwc.bit.edu.cn/tzgg',
};

async function handler() {
    const link = 'https://jwc.bit.edu.cn/tzgg/';
    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = load(response.data);

    const list = $('li.gpTextArea').toArray();

    const result = await util.ProcessFeed(list, cache);

    return {
        title: $('title').text(),
        link,
        description: '北京理工大学教务部',
        item: result,
    };
}

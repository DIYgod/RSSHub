import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/hangzhou',
    categories: ['forecast'],
    example: '/tingshuitz/hangzhou',
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
            source: ['www.hzwgc.com/public/stop_the_water', 'www.hzwgc.com/'],
        },
    ],
    name: '杭州市',
    maintainers: ['znhocn'],
    handler,
    url: 'www.hzwgc.com/public/stop_the_water',
};

async function handler() {
    // const area = ctx.req.param('area');
    const url = 'http://www.hzwgc.com/public/stop_the_water/';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = load(data);
    const list = $('.datalist li');

    return {
        title: $('title').text(),
        link: 'http://www.hzwgc.com/public/stop_the_water/',
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item: list.toArray().map((item) => {
            item = $(item);
            return {
                title: item.find('.title').text(),
                description: `杭州市停水通知：${item.find('.title').text()}`,
                pubDate: new Date(item.find('.published').text()).toUTCString(),
                link: `http://www.hzwgc.com${item.find('.btn-read').attr('href')}`,
            };
        }),
    };
}

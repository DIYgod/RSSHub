import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
            const $item = $(item);
            const publishedDate = $item.find('.published').text();
            return {
                title: $item.find('.title').text(),
                pubDate: publishedDate.trim() ? parseDate(new Date(publishedDate)) : undefined,
                link: `http://www.hzwgc.com${$item.find('.btn-read').attr('href')}`,
            };
        }),
    };
}

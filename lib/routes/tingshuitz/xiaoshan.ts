import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/xiaoshan',
    categories: ['forecast'],
    example: '/tingshuitz/xiaoshan',
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
            source: ['www.xswater.com/gongshui/channels/227.html', 'www.xswater.com/'],
        },
    ],
    name: '萧山区',
    maintainers: ['znhocn'],
    handler,
    url: 'www.xswater.com/gongshui/channels/227.html',
};

async function handler() {
    // const area = ctx.req.param('area');
    const url = 'https://www.xswater.com/gongshui/channels/227.html';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = load(data);
    const list = $('.ul-list li');

    return {
        title: $('title').text(),
        link: 'https://www.xswater.com/gongshui/channels/227.html',
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item: list.toArray().map((item) => {
            const $item = $(item);
            const publishedDate = $item.find('span').text().slice(1, 11);
            return {
                title: $item.find('a').text(),
                pubDate: publishedDate.trim() ? parseDate(new Date(publishedDate)) : undefined,
                link: `https://www.xswater.com${$item.find('a').attr('href')}`,
            };
        }),
    };
}

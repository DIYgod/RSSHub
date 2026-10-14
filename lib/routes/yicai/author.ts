import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';

import { processItems, rootUrl } from './utils';

export const route: Route = {
    path: '/author/:id?',
    categories: ['traditional-media'],
    example: '/yicai/author/100005663',
    parameters: { id: '作者 id，可在对应作者页中找到，默认为第一财经研究院' },
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
            source: ['yicai.com/author/:id', 'yicai.com/author'],
            target: '/author/:id?',
        },
    ],
    name: '一财号',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = (ctx.req.param('id') ?? '100005663').replace(/\.html$/, '');

    const currentUrl = `${rootUrl}/author/${id}.html`;
    const apiUrl = `${rootUrl}/api/ajax/getlistbysid?id=${id}&page=1&pagesize=${getRouteLimit(ctx, 30)}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = await processItems(apiUrl);

    return {
        title: `第一财经一财号 - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    };
}

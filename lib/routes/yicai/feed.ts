import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

import { rootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: '/feed/:id?',
    categories: ['traditional-media'],
    example: '/yicai/feed/669',
    parameters: { id: '主题 id，可在对应主题页中找到，默认为一财早报' },
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
            source: ['yicai.com/feed/:id', 'yicai.com/feed'],
            target: '/feed/:id',
        },
    ],
    name: '关注',
    maintainers: ['nczitzk'],
    handler,
    description: `:::tip
  全部主题词见 [此处](https://www.yicai.com/feed/alltheme)
  :::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '669';

    const currentUrl = `${rootUrl}/feed/${id}`;
    const apiUrl = `${rootUrl}/api/ajax/getlistbytid?id=${id}&page=0&pagesize=${ctx.req.query('limit') ?? 30}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = await ProcessItems(apiUrl, cache.tryGet);

    return {
        title: `第一财经主题 - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    };
}

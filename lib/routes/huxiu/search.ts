import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { apiSearchRootUrl, fetchData, generateSignature, processItems, rootUrl } from './util';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['new-media'],
    example: '/huxiu/search/生活',
    parameters: { keyword: '关键字' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['huxiu.com/'],
        },
    ],
    name: '搜索',
    maintainers: ['xyqfer', 'HenryQW', 'nczitzk'],
    handler,
    url: 'huxiu.com/',
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const apiUrl = new URL('api/article', apiSearchRootUrl).href;
    const currentUrl = rootUrl;

    const { data: response } = await got.post(apiUrl, {
        searchParams: {
            platform: 'www',
            s: keyword,
            sort: '',
            page: 1,
            pagesize: limit,
            appid: 'hx_search_202303',
            ...generateSignature(),
        },
    });

    const items = await processItems(response.data.datalist, limit, cache.tryGet);

    const data = await fetchData(currentUrl);
    data.title = `${keyword}-搜索结果-${data.title}`;

    ctx.set('json', response.data.datalist);

    return {
        item: items,
        ...data,
    };
}

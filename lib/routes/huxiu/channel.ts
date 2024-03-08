import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { rootUrl, apiArticleRootUrl, processItems, fetchData } from './util';

export const route: Route = {
    path: ['/article', '/channel/:id?'],
    categories: ['traditional-media'],
    example: '/huxiu/article',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: {
        source: ['huxiu.com/article'],
    },
    name: '资讯',
    maintainers: ['HenryQW', 'nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const apiUrl = new URL(`web/${id ? 'channel' : 'article'}/articleList`, apiArticleRootUrl).href;
    const currentUrl = new URL(id ? `channel/${id}.html` : 'article', rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            channel_id: id,
            pagesize: limit,
        },
    });

    const items = await processItems(response.data?.dataList ?? response.data.datalist, limit, cache.tryGet);

    const data = await fetchData(currentUrl);

    return {
        item: items,
        ...data,
    };
}

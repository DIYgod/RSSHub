import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { rootUrl, apiRootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: '/hot',
    categories: ['new-media'],
    example: '/hk01/hot',
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
            source: ['hk01.com/hot', 'hk01.com/'],
        },
    ],
    name: '热门',
    maintainers: ['hoilc', 'Fatpandac', 'nczitzk'],
    handler,
    url: 'hk01.com/hot',
};

async function handler(ctx) {
    const currentUrl = `${rootUrl}/hot`;
    const apiUrl = `${apiRootUrl}/v2/feed/hot`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await ProcessItems(response.data.items, ctx.req.query('limit'), cache.tryGet);

    return {
        title: '熱門新聞、全城熱話及社會時事 | 香港01',
        link: currentUrl,
        item: items,
    };
}

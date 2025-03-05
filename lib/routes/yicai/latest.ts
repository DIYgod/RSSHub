import { Route } from '@/types';
import cache from '@/utils/cache';
import { rootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: '/latest',
    categories: ['traditional-media'],
    example: '/yicai/latest',
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
            source: ['yicai.com/'],
        },
    ],
    name: '最新',
    maintainers: ['nczitzk'],
    handler,
    url: 'yicai.com/',
};

async function handler(ctx) {
    const apiUrl = `${rootUrl}/api/ajax/getlatest?page=1&pagesize=${ctx.req.query('limit') ?? 30}`;

    const items = await ProcessItems(apiUrl, cache.tryGet);

    return {
        title: '第一财经 - 最新',
        link: rootUrl,
        item: items,
    };
}

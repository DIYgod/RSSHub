import type { Route } from '@/types';

import { processItems } from './utils';

const baseURL = 'https://www.hao6v.cc/gvod/zx.html';

export const route: Route = {
    path: '/latestMovies',
    categories: ['multimedia'],
    example: '/6v123/latestMovies',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['hao6v.com/', 'hao6v.com/gvod/zx.html'],
        },
    ],
    name: '最新电影',
    maintainers: ['tc9011'],
    handler,
    url: 'hao6v.com/',
};

async function handler(ctx) {
    const item = await processItems(ctx, baseURL, [/第*集/, /第*季/, /(ep)\d+/i, /(s)\d+/i, /更新/]);

    return {
        title: '6v电影-最新电影',
        link: baseURL,
        description: '6v最新电影RSS',
        item,
    };
}

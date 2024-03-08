import { Route } from '@/types';
import { processItems } from './utils';

const baseURL = 'https://www.hao6v.tv/gvod/dsj.html';

export const route: Route = {
    path: '/latestTVSeries',
    categories: ['picture'],
    example: '/6v123/latestTVSeries',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['hao6v.com/', 'hao6v.com/gvod/dsj.html'],
    },
    name: '最新电视剧',
    maintainers: ['tc9011'],
    handler,
};

async function handler(ctx) {
    const item = await processItems(ctx, baseURL);

    return {
        title: '6v电影-最新电影',
        link: baseURL,
        description: '6v最新电影RSS',
        item,
    };
}

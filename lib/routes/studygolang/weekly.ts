import { Route } from '@/types';
import { FetchGoItems } from './utils';

export const route: Route = {
    path: '/weekly',
    categories: ['programming'],
    example: '/studygolang/weekly',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '周刊',
    maintainers: ['CWeilet', 'nczitzk'],
    handler,
};

async function handler(ctx) {
    return await FetchGoItems(ctx, 'weekly');
}

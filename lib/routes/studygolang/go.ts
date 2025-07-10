import { Route } from '@/types';
import { FetchGoItems } from './utils';

export const route: Route = {
    path: '/go/:id?',
    categories: ['programming'],
    example: '/studygolang/go/daily',
    parameters: { id: '板块 id，默认为周刊' },
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
            source: ['studygolang.com/go/:id', 'studygolang.com/'],
        },
    ],
    name: '板块',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    return await FetchGoItems(ctx);
}

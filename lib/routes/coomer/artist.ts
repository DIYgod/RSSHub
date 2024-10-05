import { Route } from '@/types';
import fetchItems from './utils';

export const route: Route = {
    path: '/artist/:id',
    categories: ['multimedia'],
    example: '/coomer/artist/belledelphine',
    parameters: { id: 'Artist id, can be found in URL' },
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
            source: ['coomer.party/onlyfans/user/:id', 'coomer.party/'],
        },
    ],
    name: 'Artist',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const currentUrl = `onlyfans/user/${id}`;

    return await fetchItems(ctx, currentUrl);
}

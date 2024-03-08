import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/tag/:id?',
    categories: ['government'],
    example: '/sobooks/tag/小说',
    parameters: { id: '标签, 见下表，默认为小说' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['sobooks.net/books/tag/:tag'],
        target: '/tag/:tag',
    },
    name: '标签',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '小说';

    ctx.set('data', await utils(ctx, `books/tag/${id}`));
}

import { Route } from '@/types';
import { ProcessFeed } from './utils';

export const route: Route = {
    path: '/items/character/:id/:order?',
    categories: ['program-update'],
    example: '/hpoi/items/character/1035374',
    parameters: { id: '角色 ID', order: '排序, 见下表，默认为 add' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '角色周边',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    ctx.set('data', await ProcessFeed('character', ctx.req.param('id'), ctx.req.param('order')));
}

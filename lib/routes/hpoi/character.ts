import type { Route } from '@/types';
import { ViewType } from '@/types';

import { ProcessFeed } from './utils';

export const route: Route = {
    path: '/items/character/:id/:order?',
    categories: ['anime'],
    view: ViewType.Pictures,
    example: '/hpoi/items/character/1035374',
    parameters: {
        id: '角色 ID',
        order: {
            description: '排序',
            options: [
                { value: 'release', label: '发售' },
                { value: 'add', label: '入库' },
                { value: 'hits', label: '总热度' },
                { value: 'hits7Day', label: '一周热度' },
                { value: 'hitsDay', label: '一天热度' },
                { value: 'rating', label: '评价' },
            ],
            default: 'add',
        },
    },
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
    return await ProcessFeed('character', ctx.req.param('id'), ctx.req.param('order'));
}

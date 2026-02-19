import type { Route } from '@/types';
import { ViewType } from '@/types';

import { ProcessFeed } from './utils';

export const route: Route = {
    path: '/items/all/:order?',
    categories: ['anime'],
    view: ViewType.Pictures,
    example: '/hpoi/items/all',
    parameters: {
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
    radar: [
        {
            source: ['www.hpoi.net/hobby/all'],
            target: '/items/all',
        },
    ],
    name: '所有周边',
    maintainers: ['DIYgod'],
    handler,
    url: 'www.hpoi.net/hobby/all',
};

async function handler(ctx) {
    return await ProcessFeed('all', 0, ctx.req.param('order'));
}

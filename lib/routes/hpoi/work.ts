import { Route, ViewType } from '@/types';
import { ProcessFeed } from './utils';

export const route: Route = {
    path: '/items/work/:id/:order?',
    categories: ['anime', 'popular'],
    view: ViewType.Pictures,
    example: '/hpoi/items/work/4117491',
    parameters: {
        id: '作品 ID',
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
    name: '作品周边',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    return await ProcessFeed('work', ctx.req.param('id'), ctx.req.param('order'));
}

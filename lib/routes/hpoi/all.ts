import { Route } from '@/types';
import { ProcessFeed } from './utils';

export const route: Route = {
    path: '/items/all/:order?',
    categories: ['anime'],
    example: '/hpoi/items/all',
    parameters: { order: '排序, 见下表，默认为 add' },
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
    description: `| 发售    | 入库 | 总热度 | 一周热度 | 一天热度 | 评价   |
  | ------- | ---- | ------ | -------- | -------- | ------ |
  | release | add  | hits   | hits7Day | hitsDay  | rating |`,
};

async function handler(ctx) {
    return await ProcessFeed('all', 0, ctx.req.param('order'));
}

import type { Data, Route } from '@/types';

import { getDesignFeed } from '../design';

const categories = new Map([
    [1, { id: '16', title: '学院新闻 - 浙工大设建学院' }],
    [2, { id: '18', title: '公告通知 - 浙工大设建学院' }],
    [3, { id: '25', title: '科研申报 - 浙工大设建学院' }],
    [4, { id: '26', title: '科研成果 - 浙工大设建学院' }],
    [5, { id: '27', title: '文件与资源 - 浙工大设建学院' }],
    [6, { id: '20', title: '学术交流 - 浙工大设建学院' }],
]);

export const route: Route = {
    path: '/da/:type',
    categories: ['university'],
    example: '/zjut/da/1',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '设计与建筑学院',
    maintainers: ['yikZero'],
    url: 'www.design.zjut.edu.cn',
    handler,
    description: `| 学院新闻 | 公告通知 | 科研申报 | 科研成果 | 文件与资源 | 学术交流 |
| -------- | -------- | -------- | -------- | ---------- | -------- |
| 1        | 2        | 3        | 4        | 5          | 6        |`,
};

async function handler(ctx): Promise<Data> {
    const category = categories.get(Number.parseInt(ctx.req.param('type')));
    if (!category) {
        throw new Error('Invalid design-school category. Valid types are: 1, 2, 3, 4, 5, 6.');
    }
    const feed = await getDesignFeed(category.id);
    return { ...feed, title: category.title };
}

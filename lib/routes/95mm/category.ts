import type { Route } from '@/types';

import { ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: '/category/:category',
    categories: ['picture'],
    example: '/95mm/category/1',
    parameters: { category: '集合，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['95mm.org/'],
        },
    ],
    name: '集合',
    maintainers: ['nczitzk'],
    handler,
    url: '95mm.org/',
    description: `| 清纯唯美 | 摄影私房 | 明星写真 | 三次元 | 异域美景 | 性感妖姬 | 游戏主题 | 美女壁纸 |
| -------- | -------- | -------- | ------ | -------- | -------- | -------- | -------- |
| 1        | 2        | 4        | 5      | 6        | 7        | 9        | 11       |`,
};

async function handler(ctx) {
    const categories = {
        1: '清纯唯美',
        2: '摄影私房',
        4: '明星写真',
        5: '三次元',
        6: '异域美景',
        7: '性感妖姬',
        9: '游戏主题',
        11: '美女壁纸',
    };

    const category = ctx.req.param('category');

    const currentUrl = `${rootUrl}/category-${category}/list-1/index.html?page=1`;

    return await ProcessItems(ctx, categories[category], currentUrl);
}

import { Route } from '@/types';
import { rootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: '/category/:category',
    categories: ['anime'],
    example: '/95mm/category/1',
    parameters: { category: '集合，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['95mm.org/'],
    },
    name: '集合',
    maintainers: ['nczitzk'],
    handler,
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

    ctx.set('data', await ProcessItems(ctx, categories[category], currentUrl));
}

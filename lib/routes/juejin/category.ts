import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import util from './utils';

export const route: Route = {
    path: '/category/:category',
    categories: ['programming'],
    example: '/juejin/category/frontend',
    parameters: { category: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['DIYgod'],
    handler,
    description: `| 后端    | 前端     | Android | iOS | 人工智能 | 开发工具 | 代码人生 | 阅读    |
  | ------- | -------- | ------- | --- | -------- | -------- | -------- | ------- |
  | backend | frontend | android | ios | ai       | freebie  | career   | article |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');

    const idResponse = await got({
        method: 'get',
        url: 'https://api.juejin.cn/tag_api/v1/query_category_briefs?show_type=0',
    });

    const cat = idResponse.data.data.find((item) => item.category_url === category);
    const id = cat.category_id;

    const response = await got({
        method: 'post',
        url: 'https://api.juejin.cn/recommend_api/v1/article/recommend_cate_feed',
        json: {
            id_type: 2,
            sort_type: 300,
            cate_id: id,
            cursor: '0',
            limit: 20,
        },
    });

    let originalData = [];
    if (response.data.data) {
        originalData = response.data.data;
    }
    const resultItems = await util.ProcessFeed(originalData, cache);

    return {
        title: `掘金 ${cat.category_name}`,
        link: `https://juejin.cn/${category}`,
        description: `掘金 ${cat.category_name}`,
        item: resultItems,
    };
}

import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getCategoryBrief, parseList, ProcessFeed } from './utils';

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
    radar: [
        {
            source: ['juejin.cn/:category'],
        },
    ],
    name: '分类',
    maintainers: ['DIYgod'],
    handler,
    description: `| 后端    | 前端     | Android | iOS | 人工智能 | 开发工具 | 代码人生 | 阅读    |
| ------- | -------- | ------- | --- | -------- | -------- | -------- | ------- |
| backend | frontend | android | ios | ai       | freebie  | career   | article |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');

    const idResponse = await getCategoryBrief();

    const cat = idResponse.find((item) => item.category_url === category);
    if (!cat) {
        throw new Error('分类不存在');
    }
    const id = cat.category_id;

    const response = await ofetch('https://api.juejin.cn/recommend_api/v1/article/recommend_cate_feed', {
        method: 'POST',
        body: {
            id_type: 2,
            sort_type: 300,
            cate_id: id,
            cursor: '0',
            limit: 20,
        },
    });

    const list = parseList(response.data);
    const resultItems = await ProcessFeed(list);

    return {
        title: `掘金 ${cat.category_name}`,
        link: `https://juejin.cn/${category}`,
        description: `掘金 ${cat.category_name}`,
        item: resultItems,
    };
}

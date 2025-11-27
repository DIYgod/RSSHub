import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

import { author, language, processItems, rootUrl } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = rootUrl;
    const apiUrl: string = new URL(`api/articles/${id ? 'categoryId' : 'all'}`, rootUrl).href;
    const apiCategoryUrl: string = new URL('api/categories/all', rootUrl).href;

    const apiResponse = await ofetch(apiUrl, {
        query: {
            datasrc: id ? 'categoriesall' : 'articles',
            current: 1,
            size: limit,
            categoryId: id,
        },
    });

    const apiCategoryResponse = await ofetch(apiCategoryUrl, {
        query: {
            datasrc: 'categories',
        },
    });

    const categoryName: string = apiCategoryResponse.data.find((item) => item.categoryid === id)?.category;

    const items: DataItem[] = processItems(apiResponse.data.records, limit);

    return {
        title: `${author}${categoryName ? ` - ${categoryName}` : ''}`,
        description: categoryName,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author,
        language,
    };
};

export const route: Route = {
    path: '/n/category/:id?',
    name: '盐选故事分类',
    url: 'n.ifun.cool',
    maintainers: ['nczitzk'],
    handler,
    example: '/ifun/n/category',
    parameters: {
        id: '分类 id，默认为空，即全部，见下表',
    },
    description: `
| 名称     | ID  |
| -------- | --- |
| 全部     |     |
| 通告     | 1   |
| 故事盐选 | 2   |
| 趣集精选 | 3   |
    `,
    categories: ['new-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['n.ifun.cool'],
            target: '/n/category/:id?',
        },
        {
            title: '全部',
            source: ['n.ifun.cool'],
            target: '/n/category',
        },
        {
            title: '通告',
            source: ['n.ifun.cool'],
            target: '/n/category/1',
        },
        {
            title: '盐选故事',
            source: ['n.ifun.cool'],
            target: '/n/category/2',
        },
        {
            title: '趣集精选',
            source: ['n.ifun.cool'],
            target: '/n/category/3',
        },
    ],
    view: ViewType.Articles,
};

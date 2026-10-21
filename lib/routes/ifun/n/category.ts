import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { apiRoot, author, getRecords, language, processItems, rootUrl } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const apiCategoryResponse = await ofetch(`${apiRoot}/categories/list`);
    if (apiCategoryResponse?.code !== 200 || !Array.isArray(apiCategoryResponse.data)) {
        throw new Error('iRead did not return its categories. Check whether the source API has changed.');
    }
    const categoryName: string | undefined = id ? apiCategoryResponse.data.find((item) => String(item.categoryid) === id)?.category : undefined;
    if (id && !categoryName) {
        throw new Error(`Unknown iRead category ID: ${id}. See the supported category IDs in the route documentation.`);
    }
    const targetUrl = new URL(categoryName ? `categories/${encodeURIComponent(categoryName)}` : 'articles', rootUrl).href;
    const apiResponse = await ofetch(`${apiRoot}/post/list${categoryName ? '/cat' : ''}`, {
        method: 'POST',
        body: { current: 1, pageSize: limit, searchText: '', ...(categoryName && { category: categoryName }) },
    });
    const items: DataItem[] = processItems(getRecords(apiResponse), limit);

    return {
        title: `${author}${categoryName ? ` - ${categoryName}` : ''}`,
        description: categoryName,
        link: targetUrl,
        item: items,
        author,
        language,
    };
};

export const route: Route = {
    path: '/n/category/:id?',
    name: '盐选故事分类',
    url: 'iread.life',
    maintainers: ['nczitzk'],
    handler,
    example: '/ifun/n/category',
    parameters: {
        id: '分类 id，默认为空，即全部，见下表',
    },
    description: `| 名称     | ID |
| -------- | -- |
| 全部     |    |
| 通告     | 1  |
| 故事盐选 | 2  |
| 趣集精选 | 3  |`,
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
        {
            title: '全部',
            source: ['iread.life/', 'iread.life/articles'],
            target: '/n/category',
        },
        {
            source: ['iread.life/categories/通告'],
            target: '/n/category/1',
        },
        {
            source: ['iread.life/categories/故事盐选'],
            target: '/n/category/2',
        },
        {
            source: ['iread.life/categories/趣集精选'],
            target: '/n/category/3',
        },
    ],
    view: ViewType.Articles,
};

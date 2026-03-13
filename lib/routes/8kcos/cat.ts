import type { Route } from '@/types';

import { getCategoryInfo, getPosts } from './utils';

export const route: Route = {
    path: '/cat/:cat?',
    parameters: {
        cat: '默认值为 `8kasianidol`，将目录页面url中 /category/ 后面的部分填入。如：https://www.8kcosplay.com/category/8kchineseidol/%e9%a3%8e%e4%b9%8b%e9%a2%86%e5%9f%9f/ 对应的RSS页面为 /8kcos/cat/%e9%a3%8e%e4%b9%8b%e9%a2%86%e5%9f%9f。',
    },
    example: '/8kcos/cat/8kasianidol',
    radar: [
        {
            source: ['8kcosplay.com/category/:mainCategory/:cat/', '8kcosplay.com/category/:cat/'],
            target: '/cat/:cat',
        },
    ],
    name: '分类',
    maintainers: ['KotoriK'],
    handler,
    url: '8kcosplay.com/',
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit') ?? 10, 10);
    const { cat = '8kasianidol' } = ctx.req.param();
    const categoryInfo = await getCategoryInfo(cat);
    const items = await getPosts(limit, { categories: categoryInfo.id });

    return {
        title: categoryInfo.title,
        description: categoryInfo.description,
        link: categoryInfo.link,
        item: items,
    };
}

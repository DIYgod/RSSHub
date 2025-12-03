import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import type { Article } from './types';
import { getCollection, parseList, ProcessFeed } from './utils';

export const route: Route = {
    path: '/collections/:userId',
    categories: ['programming'],
    example: '/juejin/collections/1697301682482439',
    parameters: { userId: '用户唯一标志符, 在浏览器地址栏URL中能够找到' },
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
            source: ['juejin.cn/user/:id', 'juejin.cn/user/:id/collections'],
            target: '/collections/:id',
        },
    ],
    name: '收藏集',
    maintainers: ['yang131323'],
    handler,
};

// 获取所有收藏夹文章内容
async function getArticleList(collectionId) {
    const collectPage = await getCollection(collectionId);

    return collectPage.article_list;
}

async function handler(ctx) {
    const userId = ctx.req.param('userId');
    const response = await ofetch(`https://api.juejin.cn/interact_api/v1/collectionSet/list?user_id=${userId}&cursor=0&limit=20`);

    // 获取用户所有收藏夹id
    const collectionId = response.data.map((item) => item.tag_id);

    const temp = (await Promise.all(collectionId.map((id) => getArticleList(id)))) as Article[][];
    const posts = temp.flat().filter(Boolean);
    const list = parseList(posts);

    const result = await ProcessFeed(list);

    return {
        title: '掘金 - 收藏集',
        link: `https://juejin.im/user/${userId}/collections`,
        description: '掘金，指定用户整个收藏集',
        item: result,
        allowEmpty: true,
    };
}

import { Route } from '@/types';
import { getCollection, parseList, ProcessFeed } from './utils';

export const route: Route = {
    path: '/collection/:collectionId',
    categories: ['programming'],
    example: '/juejin/collection/6845243180586123271',
    parameters: { collectionId: '收藏夹唯一标志符, 在浏览器地址栏URL中能够找到' },
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
            source: ['juejin.cn/collection/:collectionId'],
        },
    ],
    name: '单个收藏夹',
    maintainers: ['yang131323'],
    handler,
};

async function handler(ctx) {
    const collectionId = ctx.req.param('collectionId');

    const collectPage = await getCollection(collectionId);

    const items = parseList(collectPage.article_list);

    const result = await ProcessFeed(items);

    return {
        title: `${collectPage.detail.tag_name} - ${collectPage.create_user.user_name}的收藏集 - 掘金`,
        link: `https://juejin.cn/collection/${collectionId}`,
        description: '掘金，用户单个收藏夹',
        item: result,
        allowEmpty: true,
    };
}

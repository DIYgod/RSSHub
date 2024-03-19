import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import util from './utils';

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
    maintainers: ['isQ'],
    handler,
};

async function handler(ctx) {
    const collectionId = ctx.req.param('collectionId');

    const collectPage = await got({
        method: 'get',
        url: `https://api.juejin.cn/interact_api/v1/collectionSet/get?tag_id=${collectionId}&cursor=0`,
    });

    let items = [];
    if (collectPage.data.data && collectPage.data.data.article_list) {
        items = collectPage.data.data.article_list.slice(0, 10);
    }

    const result = await util.ProcessFeed(items, cache);

    return {
        title: '掘金 - 单个收藏夹',
        link: `https://juejin.cn/collection/${collectionId}`,
        description: '掘金，用户单个收藏夹',
        item: result,
        allowEmpty: true,
    };
}

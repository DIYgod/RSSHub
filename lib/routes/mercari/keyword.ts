import type { Route } from '@/types';
import cache from '@/utils/cache';

import { fetchItemDetail, fetchSearchItems, formatItemDetail, MercariOrder, MercariSort, MercariStatus } from './util';

export const route: Route = {
    path: '/:sort/:order/:status/:keyword',
    categories: ['shopping'],
    parameters: {
        sort: {
            description: '排序方式',
            default: 'default',
            options: [
                { value: 'default', label: '默认排序' },
                { value: 'create_time', label: '发布时间' },
                { value: 'score', label: '评分' },
                { value: 'like', label: '点赞' },
                { value: 'price', label: '价格' },
            ],
        },
        order: {
            description: '排序顺序',
            default: 'desc',
            options: [
                { value: 'desc', label: '降序' },
                { value: 'asc', label: '升序' },
            ],
        },
        status: {
            description: '商品状态',
            default: 'default',
            options: [
                { value: 'default', label: '全部' },
                { value: 'onsale', label: '在售' },
                { value: 'soldout', label: '已售' },
            ],
        },
        keyword: {
            description: '关键词',
        },
    },
    example: '/mercari/create_time/desc/default/ふもふも',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '关键词',
    maintainers: ['yana9i'],
    url: 'jp.mercari.com',
    handler,
};

async function handler(ctx) {
    const { sort, order, status, keyword } = ctx.req.param();
    const statusArray = MercariStatus[status] ? [MercariStatus[status]] : [];
    const searchItems = (await fetchSearchItems(MercariSort[sort], MercariOrder[order], statusArray, keyword)).items;
    const items = await Promise.all(searchItems.map((item) => cache.tryGet(`mercari:${item.id}`, async () => await fetchItemDetail(item.id, item.itemType).then((detail) => formatItemDetail(detail)))));

    return {
        title: `${keyword} の検索結果`,
        link: `https://jp.mercari.com/search?sort=${MercariSort[sort]}&order=${MercariOrder[order]}&status=${MercariStatus[status]}&keyword=${encodeURIComponent(keyword)}`,
        description: `Search results for keyword: ${keyword}`,
        item: items,
    };
}

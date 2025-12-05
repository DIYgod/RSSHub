import type { Route } from '@/types';
import cache from '@/utils/cache';

import { fetchItemDetail, fetchSearchItems, formatItemDetail, MercariOrder, MercariSort, MercariStatus } from './util';

export const route: Route = {
    path: '/search/:query',
    categories: ['shopping'],
    example: '/mercari/search/keyword=シャツ&7bd3eacc-ae45-4d73-bc57-a611c9432014=340258ac-e220-4722-8c35-7f73b7382831',
    parameters: {
        query: 'Search parameters in URL query string format.',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Search',
    maintainers: ['yana9i', 'Tsuyumi25'],
    url: 'jp.mercari.com',
    handler,
    description: `::: warning
此路由僅支援 \`jp.mercari.com\`，不支援 \`tw.mercari.com\` 和 \`hk.mercari.com\`。

**注意：** 不同站點的查詢參數格式不同
- 日本: \`keyword=シャツ&order=desc&sort=created_time&status=on_sale\`
- 台灣: \`keyword=シャツ&sort=new&status=in-stock&availability=1\`
:::`,
};

function parseSearchQuery(queryString: string) {
    const params = new URLSearchParams(queryString);

    const keyword = params.get('keyword') || '';
    const sort = MercariSort[params.get('sort') as keyof typeof MercariSort] || MercariSort.default;
    const order = MercariOrder[params.get('order') as keyof typeof MercariOrder] || MercariOrder.desc;

    const statusMap: Record<string, keyof typeof MercariStatus> = {
        on_sale: 'onsale',
        'sold_out|trading': 'soldout',
    };
    const statusArray =
        params
            .get('status')
            ?.split(',')
            .map((s) => MercariStatus[statusMap[s]])
            .filter(Boolean) || [];

    const attributeIds = [
        '7bd3eacc-ae45-4d73-bc57-a611c9432014', // 色
        '47295d80-5839-4237-bbfc-deb44b4e7999', // 割引オプション
        'f42ae390-04ff-46ea-808b-f5d97cb45db4', // サイズ
        'd664efe3-ae5a-4824-b729-e789bf93aba9', // 出品形式
    ];

    const attributes: Array<{ id: string; values: string[] }> = [];
    for (const id of attributeIds) {
        const values = params.get(id);
        if (values) {
            attributes.push({ id, values: values.split(',') });
        }
    }

    const options = {
        categoryId: params.get('category_id')?.split(',').map(Number),
        brandId: params.get('brand_id')?.split(',').map(Number),
        priceMin: params.get('price_min') ? Number(params.get('price_min')) : undefined,
        priceMax: params.get('price_max') ? Number(params.get('price_max')) : undefined,
        itemConditionId: params.get('item_condition_id')?.split(',').map(Number),
        excludeKeyword: params.get('exclude_keyword') || undefined,
        itemTypes: params
            .get('item_types')
            ?.split(',')
            .map((type) => (type === 'mercari' ? 'ITEM_TYPE_MERCARI' : type === 'beyond' ? 'ITEM_TYPE_BEYOND' : type)),
        attributes,
    };

    return { keyword, sort, order, status: statusArray, options };
}

async function handler(ctx) {
    const queryString = ctx.req.param('query');

    const { keyword, sort, order, status, options } = parseSearchQuery(queryString);
    const searchItems = (await fetchSearchItems(sort, order, status, keyword, options)).items;

    const items = await Promise.all(searchItems.map((item) => cache.tryGet(`mercari:${item.id}`, async () => await fetchItemDetail(item.id, item.itemType).then((detail) => formatItemDetail(detail)))));

    return {
        title: `${keyword} の検索結果`,
        link: `https://jp.mercari.com/search?${queryString}`,
        description: `Mercari advanced search results for: ${queryString}`,
        item: items,
    };
}

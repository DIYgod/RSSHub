import { renderToString } from 'hono/jsx/dom/server';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import type { DetailData, DetailResponse, Goods, ListResponse } from './types';

/**
 * Fetch the list of new products, extracting goods from every `car_product_list` floor.
 *
 * @returns {Promise<Goods[]>} The new product list.
 */
export const getNewProductList = async (): Promise<Goods[]> => {
    const response = await ofetch<ListResponse>('https://carshop-api.retail.xiaomiev.com/mtop/carlife/home/index', {
        body: [
            {},
            {
                isPreview: false,
                needDataPage: true,
                needEquity: true,
                needExtendedWarranty: true,
                needPackage: true,
                pageId: '16850',
                pageVersion: 3,
                supportRepurchaseTab: true,
            },
        ],
        method: 'POST',
    });
    const map = new Map<number, Goods>();
    for (const floor of response.data.floors) {
        if (floor.moduleKey !== 'car_product_list') {
            continue;
        }
        const blocks = floor.dynamicData ?? [];
        for (const block of blocks) {
            for (const item of block.list) {
                if (item.type === 'goods' && !map.has(item.value.goods.itemId)) {
                    map.set(item.value.goods.itemId, item.value.goods);
                }
            }
        }
    }
    return map.values().toArray();
};

/**
 * Fetch and cache new product details.
 *
 * @param {Goods} item - New product list item.
 * @returns {Promise<DetailData>} New product details.
 */
export const getNewProductItem = (item: Goods): Promise<DetailData> =>
    cache.tryGet(`xiaomiev:product:${item.itemId}`, async () => {
        const response = await ofetch<DetailResponse>('https://carshop-api.retail.xiaomiev.com/mtop/carlife/product/info', {
            body: [
                {},
                {
                    configVersion: 1,
                    productId: item.itemId,
                    servicePackageVersion: 2,
                },
            ],
            headers: {
                'X-User-Agent': 'channel/car platform/carlife.ios',
            },
            method: 'POST',
        });
        return response.data;
    }) as Promise<DetailData>;

const NewProductDescription = ({ listItem, detail }: { listItem: Goods; detail: DetailData }) => (
    <>
        <img src={listItem.img800s} />
        <br />
        <ol>
            {detail.product.sellPointList.map((point) => (
                <li>{point}</li>
            ))}
        </ol>
        <br />
        <table>
            <thead>
                <tr>
                    <th>图片</th>
                    <th>规格</th>
                    <th>原价</th>
                    <th>现价</th>
                </tr>
            </thead>
            <tbody>
                {[...detail.goodsInfo.goodsList, ...detail.batchedSsuList, ...Object.values(detail.batchedInfoMap ?? {}).flatMap(({ batchedSsuList }) => batchedSsuList)].map((goods) => (
                    <tr>
                        <td>
                            <img src={goods.imgUrl} width={48} height="auto" />
                        </td>
                        <td>{goods.name}</td>
                        <td>{goods.marketPrice} 元</td>
                        <td>{goods.price} 元</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </>
);

/**
 * Render the new product item description.
 *
 * @param {Goods} listItem - New product list item.
 * @param {DetailData} detail - New product details.
 * @returns {string} Rendered description HTML.
 */
export const renderNewProduct = (listItem: Goods, detail: DetailData): string => renderToString(<NewProductDescription listItem={listItem} detail={detail} />);

export default {
    getNewProductList,
    getNewProductItem,
    renderNewProduct,
};

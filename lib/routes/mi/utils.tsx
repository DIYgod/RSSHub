import 'dayjs/locale/zh-cn.js';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { renderToString } from 'hono/jsx/dom/server';

import ofetch from '@/utils/ofetch';

import type { CrowdfundingDetailItem, CrowdfundingDetailResponse, CrowdfundingListItem, CrowdfundingListResponse, NewProductDetailItem, NewProductDetailResponse, NewProductListItem, NewProductListResponse } from './types';

dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

/**
 * Fetch the list of crowdfunding projects, merging the current projects (primary) with the history projects (supplement).
 *
 * @returns {Promise<CrowdfundingListItem[]>} The merged crowdfunding project list.
 */
export const getCrowdfundingList = async (): Promise<CrowdfundingListItem[]> => {
    // oxlint-disable-next-line unicorn/consistent-function-scoping
    const fetch = (query?: Record<string, number>) =>
        ofetch<CrowdfundingListResponse>('https://m.mi.com/v1/crowd/crowd_home', {
            method: 'POST',
            query,
        });
    const [response, historyResponse] = await Promise.all([fetch(), fetch({ status: 1 })]);
    const map = new Map<number, CrowdfundingListItem>();
    const setIfNeeded = (items: CrowdfundingListItem[]) => {
        for (const item of items) {
            if (!map.has(item.project_id)) {
                map.set(item.project_id, item);
            }
        }
    };
    for (const group of response.data.list) {
        setIfNeeded(group.items);
    }
    for (const group of historyResponse.data.list) {
        setIfNeeded(group.items);
    }
    return map.values().toArray();
};

/**
 * Fetch crowdfunding project details.
 *
 * @param {CrowdfundingListItem} item - Crowdfunding item.
 * @returns {Promise<CrowdfundingDetailItem>} Crowdfunding item details.
 */
export const getCrowdfundingItem = async (item: CrowdfundingListItem): Promise<CrowdfundingDetailItem> => {
    const response = await ofetch<CrowdfundingDetailResponse>('https://m.mi.com/v1/crowd/crowd_detail', {
        method: 'POST',
        query: {
            project_id: item.project_id,
        },
    });
    return response.data.crowd_funding_info;
};

/**
 * Fetch the list of new products, merging `date_list` (primary) with `history_date_list` (supplement) and `new_list` (supplement).
 *
 * @returns {Promise<NewProductListItem[]>} The merged new product list.
 */
export const getNewProductList = async (): Promise<NewProductListItem[]> => {
    const response = await ofetch<NewProductListResponse>('https://api.m.mi.com/v1/home/product_channel_get_list', {
        method: 'POST',
    });
    const map = new Map<number, NewProductListItem>();
    const setIfNeeded = (items: NewProductListItem[]) => {
        for (const item of items) {
            if (!map.has(item.product_id)) {
                map.set(item.product_id, item);
            }
        }
    };
    for (const group of response.data.date_list) {
        setIfNeeded(group.product_list);
    }
    for (const group of response.data.history_date_list) {
        setIfNeeded(group.product_list);
    }
    setIfNeeded(response.data.new_list);
    return map.values().toArray();
};

/**
 * Fetch new product details.
 *
 * @param {NewProductListItem} item - New product list item.
 * @returns {Promise<NewProductDetailItem>} New product details.
 */
export const getNewProductItem = async (item: NewProductListItem): Promise<NewProductDetailItem> => {
    const response = await ofetch<NewProductDetailResponse>('https://m.mi.com/mtop/xiaomishop/product/info', {
        body: [{}, { productId: item.product_id }],
        method: 'POST',
    });
    return response.data;
};

const CrowdfundingDescription = ({ listItem, detailItem }: { listItem: CrowdfundingListItem; detailItem: CrowdfundingDetailItem }) => (
    <>
        <img src={detailItem.big_image} />
        <br />
        {detailItem.project_desc}
        <br />
        众筹价：{detailItem.price} 元，建议零售价：{listItem.product_market_price} 元
        <br />
        众筹开始：{formatDate(detailItem.start_time)}，众筹结束：{formatDate(detailItem.end_time)}
        <br />
        物流：{detailItem.send_info}
        <br />
        <table>
            <thead>
                <tr>
                    <th>图片</th>
                    <th>档位</th>
                    <th>价格</th>
                    <th>描述</th>
                </tr>
            </thead>
            <tbody>
                {detailItem.support_list.map((support) => (
                    <tr>
                        <td>
                            <img src={support.goods_list[0]?.goods_image} width={48} height="auto" />
                        </td>
                        <td>{support.name}</td>
                        <td>{support.price} 元</td>
                        <td>{support.support_desc}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </>
);

/**
 * Render the crowdfunding item description.
 *
 * @param {CrowdfundingListItem} listItem - Crowdfunding item list item.
 * @param {CrowdfundingDetailItem} detailItem - Crowdfunding item details.
 * @returns {string} Rendered description HTML.
 */
export const renderCrowdfunding = (listItem: CrowdfundingListItem, detailItem: CrowdfundingDetailItem): string => renderToString(<CrowdfundingDescription listItem={listItem} detailItem={detailItem} />);

const NewProductDescription = ({ listItem, detailItem }: { listItem: NewProductListItem; detailItem: NewProductDetailItem }) => (
    <>
        <img src={listItem.img} />
        <br />
        <ol>
            {detailItem.product.sellPointList.map((point) => (
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
                {[...(detailItem.goodsInfo.goodsList ?? []), ...(detailItem.relationBatchedInfo?.relationBatchedList.flatMap((relation) => relation.goodsInfo) ?? [])].map((goods) => (
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
 * @param {NewProductListItem} listItem - New product list item.
 * @param {NewProductDetailItem} detailItem - New product details.
 * @returns {string} Rendered description HTML.
 */
export const renderNewProduct = (listItem: NewProductListItem, detailItem: NewProductDetailItem): string => renderToString(<NewProductDescription listItem={listItem} detailItem={detailItem} />);

const formatDate = (timestamp: number): string => dayjs.unix(timestamp).tz('Asia/Shanghai').locale('zh-cn').format('lll');

export default {
    getCrowdfundingList,
    getCrowdfundingItem,
    renderCrowdfunding,
    getNewProductList,
    getNewProductItem,
    renderNewProduct,
};

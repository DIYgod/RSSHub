import 'dayjs/locale/zh-cn.js';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { renderToString } from 'hono/jsx/dom/server';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import type { CrowdfundingData, CrowdfundingDetailData, CrowdfundingDetailInfo, CrowdfundingItem, CrowdfundingList, DataResponse, NewProductDetailData, NewProductItem, NewProductListData } from './types';

dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

/**
 * Fetch the list of crowdfunding projects.
 *
 * @returns {Promise<CrowdfundingList[]>} The crowdfunding project list.
 */
export const getCrowdfundingList = async (): Promise<CrowdfundingList[]> => {
    const response = await ofetch<DataResponse<CrowdfundingData>>('https://m.mi.com/v1/crowd/crowd_home', {
        method: 'POST',
    });
    return response.data.list;
};

/**
 * Fetch and cache crowdfunding project details.
 *
 * @param {CrowdfundingItem} item - Crowdfunding item.
 * @returns {Promise<CrowdfundingDetailInfo>} Crowdfunding item details.
 */
export const getCrowdfundingItem = (item: CrowdfundingItem): Promise<CrowdfundingDetailInfo> =>
    cache.tryGet(`mi:crowdfunding:${item.project_id}`, async () => {
        const response = await ofetch<DataResponse<CrowdfundingDetailData>>('https://m.mi.com/v1/crowd/crowd_detail', {
            headers: {
                referer: 'https://m.mi.com/crowdfunding/home',
            },
            method: 'POST',
            query: {
                project_id: item.project_id,
            },
        });
        // Suggested retail price.
        if (response.data.crowd_funding_info.product_market_price === undefined) {
            response.data.crowd_funding_info.product_market_price = item.product_market_price;
        }
        // Crowdfunding starts.
        if (response.data.crowd_funding_info.start_time_desc === undefined) {
            response.data.crowd_funding_info.start_time_desc = formatDate(response.data.crowd_funding_info.start_time);
        }
        // Crowdfunding ends.
        if (response.data.crowd_funding_info.end_time_desc === undefined) {
            response.data.crowd_funding_info.end_time_desc = formatDate(response.data.crowd_funding_info.end_time);
        }
        return response.data.crowd_funding_info;
    }) as Promise<CrowdfundingDetailInfo>;

/**
 * Fetch the list of new products, merging `history_date_list` (primary) with `new_list` (supplement).
 *
 * @returns {Promise<NewProductItem[]>} The merged new product list, sorted by start time in descending order.
 */
export const getNewProductList = async (): Promise<NewProductItem[]> => {
    const response = await ofetch<DataResponse<NewProductListData>>('https://api.m.mi.com/v1/home/product_channel_get_list', {
        method: 'POST',
    });
    const map = new Map<number, NewProductItem>();
    for (const group of response.data.history_date_list) {
        for (const item of group.product_list) {
            map.set(item.product_id, item);
        }
    }
    for (const item of response.data.new_list) {
        if (!map.has(item.product_id)) {
            map.set(item.product_id, item);
        }
    }
    return map
        .values()
        .toArray()
        .toSorted((a, b) => b.start_time - a.start_time);
};

/**
 * Fetch and cache new product details.
 *
 * @param {NewProductItem} item - New product list item.
 * @returns {Promise<NewProductDetailData>} New product details.
 */
export const getNewProductItem = (item: NewProductItem): Promise<NewProductDetailData> =>
    cache.tryGet(`mi:product:${item.product_id}`, async () => {
        const response = await ofetch<DataResponse<NewProductDetailData>>('https://m.mi.com/mtop/xiaomishop/product/info', {
            body: [{}, { productId: item.product_id }],
            method: 'POST',
        });
        return response.data;
    }) as Promise<NewProductDetailData>;

const CrowdfundingDescription = ({ item }: { item: CrowdfundingDetailInfo }) => (
    <>
        <img src={item.big_image} />
        <br />
        {item.project_name}
        <br />
        {item.project_desc}
        <br />
        众筹价：{item.price} 元，建议零售价：{item.product_market_price} 元
        <br />
        众筹开始：{item.start_time_desc}，众筹结束：{item.end_time_desc}
        <br />
        物流：{item.send_info}
        <br />
        <table>
            <tbody>
                <tr>
                    <th>档位</th>
                    <th>价格</th>
                    <th>描述</th>
                </tr>
                {item.support_list.map((support, index) => (
                    <tr key={`${support.name}-${index}`}>
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
 * @param {CrowdfundingDetailInfo} item - Crowdfunding item details.
 * @returns {string} Rendered description HTML.
 */
export const renderCrowdfunding = (item: CrowdfundingDetailInfo): string => renderToString(<CrowdfundingDescription item={item} />);

const NewProductDescription = ({ listItem, detail }: { listItem: NewProductItem; detail: NewProductDetailData }) => (
    <>
        <img src={listItem.img} />
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
                    <th>规格</th>
                    <th>原价</th>
                    <th>现价</th>
                </tr>
            </thead>
            <tbody>
                {[...(detail.goodsInfo.goodsList ?? []), ...(detail.relationBatchedInfo?.relationBatchedList.flatMap((relation) => relation.goodsInfo) ?? [])].map((goods) => (
                    <tr>
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
 * @param {NewProductItem} listItem - New product list item.
 * @param {NewProductDetailData} detail - New product details.
 * @returns {string} Rendered description HTML.
 */
export const renderNewProduct = (listItem: NewProductItem, detail: NewProductDetailData): string => renderToString(<NewProductDescription listItem={listItem} detail={detail} />);

const formatDate = (timestamp: number): string => dayjs.unix(timestamp).tz('Asia/Shanghai').locale('zh-cn').format('lll');

export default {
    getCrowdfundingList,
    getCrowdfundingItem,
    renderCrowdfunding,
    getNewProductList,
    getNewProductItem,
    renderNewProduct,
};

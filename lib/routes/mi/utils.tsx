import 'dayjs/locale/zh-cn.js';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { renderToString } from 'hono/jsx/dom/server';

import ofetch from '@/utils/ofetch';

import type { CrowdfundingData, CrowdfundingDetailData, CrowdfundingDetailInfo, CrowdfundingItem, DataResponse, NewProductDetailData, NewProductItem, NewProductListData } from './types';

dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

/**
 * Fetch the list of crowdfunding projects, merging the current projects (primary) with the history projects (supplement).
 *
 * @returns {Promise<CrowdfundingItem[]>} The merged crowdfunding project list.
 */
export const getCrowdfundingList = async (): Promise<CrowdfundingItem[]> => {
    // oxlint-disable-next-line unicorn/consistent-function-scoping
    const fetch = (query?: Record<string, number>) =>
        ofetch<DataResponse<CrowdfundingData>>('https://m.mi.com/v1/crowd/crowd_home', {
            method: 'POST',
            query,
        });
    const [response, historyResponse] = await Promise.all([fetch(), fetch({ status: 1 })]);
    const map = new Map<number, CrowdfundingItem>();
    const setIfNeeded = (items: CrowdfundingItem[]) => {
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
 * @param {CrowdfundingItem} item - Crowdfunding item.
 * @returns {Promise<CrowdfundingDetailInfo>} Crowdfunding item details.
 */
export const getCrowdfundingItem = async (item: CrowdfundingItem): Promise<CrowdfundingDetailInfo> => {
    const response = await ofetch<DataResponse<CrowdfundingDetailData>>('https://m.mi.com/v1/crowd/crowd_detail', {
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
 * @returns {Promise<NewProductItem[]>} The merged new product list.
 */
export const getNewProductList = async (): Promise<NewProductItem[]> => {
    const response = await ofetch<DataResponse<NewProductListData>>('https://api.m.mi.com/v1/home/product_channel_get_list', {
        method: 'POST',
    });
    const map = new Map<number, NewProductItem>();
    const setIfNeeded = (items: NewProductItem[]) => {
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
 * @param {NewProductItem} item - New product list item.
 * @returns {Promise<NewProductDetailData>} New product details.
 */
export const getNewProductItem = async (item: NewProductItem): Promise<NewProductDetailData> => {
    const response = await ofetch<DataResponse<NewProductDetailData>>('https://m.mi.com/mtop/xiaomishop/product/info', {
        body: [{}, { productId: item.product_id }],
        method: 'POST',
    });
    return response.data;
};

const CrowdfundingDescription = ({ listItem, detail }: { listItem: CrowdfundingItem; detail: CrowdfundingDetailInfo }) => (
    <>
        <img src={detail.big_image} />
        <br />
        {detail.project_desc}
        <br />
        众筹价：{detail.price} 元，建议零售价：{listItem.product_market_price} 元
        <br />
        众筹开始：{formatDate(detail.start_time)}，众筹结束：{formatDate(detail.end_time)}
        <br />
        物流：{detail.send_info}
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
                {detail.support_list.map((support) => (
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
 * @param {CrowdfundingItem} listItem - Crowdfunding item list item.
 * @param {CrowdfundingDetailInfo} detail - Crowdfunding item details.
 * @returns {string} Rendered description HTML.
 */
export const renderCrowdfunding = (listItem: CrowdfundingItem, detail: CrowdfundingDetailInfo): string => renderToString(<CrowdfundingDescription listItem={listItem} detail={detail} />);

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
                    <th>图片</th>
                    <th>规格</th>
                    <th>原价</th>
                    <th>现价</th>
                </tr>
            </thead>
            <tbody>
                {[...(detail.goodsInfo.goodsList ?? []), ...(detail.relationBatchedInfo?.relationBatchedList.flatMap((relation) => relation.goodsInfo) ?? [])].map((goods) => (
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

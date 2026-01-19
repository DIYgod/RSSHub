import 'dayjs/locale/zh-cn.js';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { renderToString } from 'hono/jsx/dom/server';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import type { CrowdfundingData, CrowdfundingDetailData, CrowdfundingDetailInfo, CrowdfundingItem, CrowdfundingList, DataResponse } from './types';

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
        headers: {
            referer: 'https://m.mi.com/',
        },
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

const formatDate = (timestamp: number): string => dayjs.unix(timestamp).tz('Asia/Shanghai').locale('zh-cn').format('lll');

export default {
    getCrowdfundingList,
    getCrowdfundingItem,
    renderCrowdfunding,
};

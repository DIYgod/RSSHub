import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { art } from '@/utils/render';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn.js';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import path from 'node:path';
import { CrowdfundingData, CrowdfundingDetailData, CrowdfundingDetailInfo, CrowdfundingItem, CrowdfundingList, DataResponse } from './types';

dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

/**
 * 获取众筹项目列表
 *
 * @returns {Promise<CrowdfundingList[]>} 众筹项目列表。
 */
export const getCrowdfundingList = async (): Promise<CrowdfundingList[]> => {
    const response = await ofetch<DataResponse<CrowdfundingData>>('https://m.mi.com/v1/crowd/crowd_home', {
        headers: {
            referrer: 'https://m.mi.com/',
        },
        method: 'POST',
    });
    return response.data.list;
};

/**
 * 获取众筹项目详情并缓存
 *
 * @param {CrowdfundingItem} item - 众筹项目。
 * @returns {Promise<CrowdfundingDetailInfo>} 众筹项目详情。
 */
export const getCrowdfundingItem = (item: CrowdfundingItem): Promise<CrowdfundingDetailInfo> =>
    cache.tryGet(`mi:crowdfunding:${item.project_id}`, async () => {
        const response = await ofetch<DataResponse<CrowdfundingDetailData>>('https://m.mi.com/v1/crowd/crowd_detail', {
            headers: {
                referrer: 'https://m.mi.com/crowdfunding/home',
            },
            method: 'POST',
            query: {
                project_id: item.project_id,
            },
        });
        // 建议零售价
        if (response.data.crowd_funding_info.product_market_price === undefined) {
            response.data.crowd_funding_info.product_market_price = item.product_market_price;
        }
        // 众筹开始
        if (response.data.crowd_funding_info.start_time_desc === undefined) {
            response.data.crowd_funding_info.start_time_desc = formatDate(response.data.crowd_funding_info.start_time);
        }
        // 众筹结束
        if (response.data.crowd_funding_info.end_time_desc === undefined) {
            response.data.crowd_funding_info.end_time_desc = formatDate(response.data.crowd_funding_info.end_time);
        }
        return response.data.crowd_funding_info;
    }) as Promise<CrowdfundingDetailInfo>;

/**
 * 渲染众筹项目模板
 *
 * @param {CrowdfundingDetailInfo} item - 众筹项目详情。
 * @returns {string} 渲染后的众筹项目模板字符串。
 */
export const renderCrowdfunding = (item: CrowdfundingDetailInfo): string => art(path.join(__dirname, 'templates/crowdfunding.art'), item);

const formatDate = (timestamp: number): string => dayjs.unix(timestamp).tz('Asia/Shanghai').locale('zh-cn').format('lll');

export default {
    getCrowdfundingList,
    getCrowdfundingItem,
    renderCrowdfunding,
};

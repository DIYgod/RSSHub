import 'dayjs/locale/zh-cn.js';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { renderToString } from 'hono/jsx/dom/server';

dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

export type Crowdfunding = {
    /** Project image */
    image: string;
    /** Project sell point */
    sellPoint: string;
    /** Crowdfunding price */
    price: string;
    /** Suggested retail price */
    marketPrice: string;
    /** Crowdfunding start time */
    startTime: Date;
    /** Crowdfunding end time */
    endTime: Date;
    /** Shipping info */
    sendInfo: string;
    /** Support tier list */
    supportList: Array<{
        /** Product image */
        image: string;
        /** Tier name */
        name: string;
        /** Tier price */
        price: string;
        /** Tier description */
        description: string;
    }>;
};

const formatDate = (date: Date): string => dayjs(date).tz('Asia/Shanghai').locale('zh-cn').format('lll');

const CrowdfundingDescription = ({ crowdfunding }: { crowdfunding: Crowdfunding }) => (
    <>
        <img src={crowdfunding.image} />
        <br />
        {crowdfunding.sellPoint}
        <br />
        众筹价：{crowdfunding.price} 元，建议零售价：{crowdfunding.marketPrice} 元
        <br />
        众筹开始：{formatDate(crowdfunding.startTime)}，众筹结束：{formatDate(crowdfunding.endTime)}
        <br />
        物流：{crowdfunding.sendInfo}
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
                {crowdfunding.supportList.map((support) => (
                    <tr>
                        <td>
                            <img src={support.image} width={48} height={48} />
                        </td>
                        <td>{support.name}</td>
                        <td>{support.price} 元</td>
                        <td>{support.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </>
);

/**
 * Render the crowdfunding item description.
 *
 * @param {Crowdfunding} crowdfunding - Crowdfunding data.
 * @returns {string} Rendered description HTML.
 */
export const renderCrowdfunding = (crowdfunding: Crowdfunding): string => renderToString(<CrowdfundingDescription crowdfunding={crowdfunding} />);

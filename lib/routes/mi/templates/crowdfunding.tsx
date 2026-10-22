import 'dayjs/locale/zh-cn.js';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { renderToString } from 'hono/jsx/dom/server';
import { z } from 'zod';

dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

const SupportSchema = z.object({
    /** Product image */
    image: z.string(),
    /** Tier name */
    name: z.string(),
    /** Tier price */
    price: z.string(),
    /** Tier description */
    description: z.string(),
});

const CrowdfundingSchema = z
    .object({
        /** Project image */
        image: z.string(),
        /** Project sell point list */
        sellPointList: z.array(z.string()).nonempty().optional(),
        /** Project sell point */
        sellPoint: z.string().optional(),
        /** Crowdfunding price */
        price: z.string(),
        /** Suggested retail price */
        marketPrice: z.string(),
        /** Crowdfunding start time */
        startTime: z.date(),
        /** Crowdfunding end time */
        endTime: z.date(),
        /** Shipping info */
        sendInfo: z.string(),
        /** Support tier list */
        supportList: z.array(SupportSchema).nonempty(),
    })
    .refine((value) => Number(value.sellPointList !== undefined) + Number(value.sellPoint !== undefined) === 1, {
        message: 'Exactly one of sellPointList and sellPoint must be provided',
        path: ['sellPointList', 'sellPoint'],
    });

export type Crowdfunding = z.infer<typeof CrowdfundingSchema>;

const formatDate = (date: Date): string => dayjs(date).tz('Asia/Shanghai').locale('zh-cn').format('lll');

const CrowdfundingDescription = ({ crowdfunding }: { crowdfunding: Crowdfunding }) => (
    <>
        <img src={crowdfunding.image} />
        <br />
        {crowdfunding.sellPointList && (
            <>
                <ol>
                    {crowdfunding.sellPointList.map((point) => (
                        <li>{point}</li>
                    ))}
                </ol>
                <br />
            </>
        )}
        {crowdfunding.sellPoint && (
            <>
                {crowdfunding.sellPoint}
                <br />
            </>
        )}
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
export const renderCrowdfunding = (crowdfunding: Crowdfunding): string => renderToString(<CrowdfundingDescription crowdfunding={CrowdfundingSchema.parse(crowdfunding)} />);

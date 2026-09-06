import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cqzr',
    categories: ['other'],
    example: '/tpre/cqzr',
    name: '产权转让',
    maintainers: ['kt286'],
    handler,
    url: 'trade.tpre.cn/transaction-view/index?bizTypeCode=CQZR',
};

async function handler(ctx: Context) {
    const response = await ofetch('https://trade.tpre.cn/up/biz/project/anmuas/equity-trading/page', {
        query: {
            systemCode: 'PROPERTY_RIGHT_TRANSFER',
            projectInformation: '',
            current: 1,
            size: ctx.req.query('limit') ?? 10,
            _unique: Date.now(),
        },
        headers: {
            Accept: 'application/json, text/plain, */*',
            Referer: 'https://trade.tpre.cn/transaction-view/index?bizTypeCode=CQZR',
            SystemCode: 'PROPERTY_RIGHT_TRANSFER_WEB',
            uniflowSystemCode: 'INFORMATIONIZE',
        },
    });

    const items = response.data.records.map((item) => ({
        title: item.title,
        link: item.projectLink,
        pubDate: timezone(parseDate(item.startTime, 'YYYY-MM-DD'), 8),
        category: [item.bizTypeName],
        description: [
            `项目编号：${item.projectCode}`,
            item.rate && `转让比例：${Number(item.rate)}%`,
            (item.price || item.priceDescription) && `挂牌价格：${item.price ? item.price + (item.priceUnit ?? '') : item.priceDescription}`,
            item.industryInvolvedName && `所属行业：${item.industryInvolvedName}`,
            `所在地区：${[item.addressProvince, item.addressCity, item.addressCounty].filter(Boolean).join(' ')}`,
            `披露日期：${item.startTime} 至 ${item.endTime}`,
        ]
            .filter(Boolean)
            .join('<br>'),
    }));

    return {
        title: '产权转让 - 天津产权交易中心',
        link: 'https://trade.tpre.cn/transaction-view/index?bizTypeCode=CQZR',
        item: items,
    };
}

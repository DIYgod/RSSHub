import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/cqzr',
    categories: ['other'],
    example: '/tpre/cqzr',
    name: '产权转让',
    maintainers: ['kt286'],
    handler,
    url: 'trade.tpre.cn/transaction-view/index?bizTypeCode=CQZR',
};

function parsePubDate(value?: string, format = 'YYYY-MM-DD') {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(`${value} +08:00`, `${format} Z`);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function handler(ctx: Context) {
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 10;
    const response = await ofetch('https://trade.tpre.cn/up/biz/project/anmuas/equity-trading/page', {
        query: {
            systemCode: 'PROPERTY_RIGHT_TRANSFER',
            projectInformation: '',
            current: 1,
            size: limit,
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
        pubDate: parsePubDate(item.startTime),
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

import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/qyzc',
    categories: ['other'],
    example: '/tpre/qyzc',
    name: '企业资产',
    maintainers: ['kt286'],
    handler,
    url: 'trade.tpre.cn/transaction-view/enterprise-assets-view',
};

async function handler(ctx: Context) {
    const response = await ofetch('https://trade.tpre.cn/up/biz/project/anmuas/enterprise-assets/page', {
        query: {
            projectInformation: '',
            current: 1,
            size: ctx.req.query('limit') ?? 12,
            _unique: Date.now(),
        },
        headers: {
            Accept: 'application/json, text/plain, */*',
            Referer: 'https://trade.tpre.cn/transaction-view/enterprise-assets-view',
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
            item.propertyTypeName && `资产类型：${item.propertyTypeName}`,
            (item.price || item.priceDescription) && `挂牌价格：${item.price ? item.price + (item.priceUnit ?? '') : item.priceDescription}`,
            `所在地区：${[item.addressProvince, item.addressCity, item.addressCounty].filter(Boolean).join(' ')}`,
            `披露日期：${item.startTime} 至 ${item.endTime}`,
        ]
            .filter(Boolean)
            .join('<br>'),
    }));

    return {
        title: '企业资产 - 天津产权交易中心',
        link: 'https://trade.tpre.cn/transaction-view/enterprise-assets-view',
        item: items,
    };
}

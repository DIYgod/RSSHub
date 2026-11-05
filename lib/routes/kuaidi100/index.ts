import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import utils from './utils';

export const route: Route = {
    path: '/track/:number/:id/:phone?',
    categories: ['other'],
    example: '/kuaidi100/track/shunfeng/SF1007896781640/0383',
    parameters: { number: '快递公司代号', id: '订单号', phone: '手机号后四位（仅顺丰）' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '快递订单追踪',
    maintainers: ['NeverBehave'],
    handler,
    description: `快递公司代号如果不能确定，可通过下方快递列表获得。

::: warning

1. 构造链接前请确认所有参数正确：错误\`快递公司 - 订单号\`组合将会缓存信息一小段时间防止产生无用查询
2. 正常查询的订单在未签收状态下会缓存 180 秒：请控制查询频率
3. 订单完成后请尽快取消订阅，避免资源浪费

:::`,
};

async function handler(ctx) {
    // number is shorthand for company
    // id is ticket number
    // phone for shunfeng :)
    const { number, id, phone } = ctx.req.param();

    // I am doing these to avoid invaild request.
    // First, check if code is vaild
    const { status, message, company } = await utils.checkCode(number, id, phone);

    let data;

    if (status) {
        const query: any = await utils.getQuery(number, id, phone);
        data = query.data;
    } else {
        throw new Error(`[本地]信息有误，请检查后重试：${message}`);
    }

    // Maybe we can look into isCheck, condition, and state :)
    // But I just want to make it work for now.
    return {
        title: `快递 ${company.name}-${id}`,
        link: 'https://www.kuaidi100.com',
        description: `快递 ${company.name}-${id}`,
        item: data.map((item) => ({
            title: item.context,
            description: item.context,
            guid: JSON.stringify([number, id, item.time || item.ftime, item.context]),
            pubDate: parseTrackingDate(item.time || item.ftime),
            link: 'https://www.kuaidi100.com',
        })),
    };
}

const parseTrackingDate = (date?: string) => (date ? (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(date) ? parseDate(date) : timezone(parseDate(date), 8)) : undefined);

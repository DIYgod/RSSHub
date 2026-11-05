import crypto from 'node:crypto';

import type { Context } from 'hono';
import { Agent } from 'undici';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const types = {
    PROCUREMENT: '招标采购公告',
    PURCHASE_SERVICE: '采购服务',
    VENDOR: '供应商公告',
    IMPORTANT_NOTICE: '系统通知',
};

const dispatcher = new Agent({
    connect: {
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
    },
});

export const route: Route = {
    path: '/b2b/:type?',
    categories: ['other'],
    example: '/10086/b2b/PROCUREMENT',
    parameters: {
        type: {
            description: '公告类型',
            options: Object.entries(types).map(([value, label]) => ({ value, label })),
            default: 'PROCUREMENT',
        },
    },
    radar: [
        {
            source: ['b2b.10086.cn/'],
            target: '/b2b',
        },
    ],
    name: '采购与招标网公告',
    maintainers: ['TonyRL'],
    handler,
    url: 'b2b.10086.cn',
};

async function handler(ctx: Context) {
    const { type = 'PROCUREMENT' } = ctx.req.param();
    if (!Object.hasOwn(types, type)) {
        throw new InvalidParameterError(`Invalid type: ${type}. Use one of ${Object.keys(types).join(', ')}.`);
    }
    const baseUrl = 'https://b2b.10086.cn';

    const response = await ofetch(`${baseUrl}/api-b2b/api-sync-es/white_list_api/b2b/publish/queryList`, {
        method: 'POST',
        body: {
            size: Number(ctx.req.query('limit') ?? '20'),
            current: 1,
            publishType: type,
            sfactApplColumn5: 'PC',
        },
        dispatcher,
    });

    const items = response.data.content.map((item) => ({
        title: item.name,
        link: `${baseUrl}/#/noticeDetail?publishId=${item.id}&publishUuid=${item.uuid}&publishType=${item.publishType}&publishOneType=${item.publishOneType}`,
        pubDate: timezone(parseDate(item.publishDate), 8),
        category: [item.publishOneType_dictText, item.companyTypeName],
    }));

    return {
        title: `中国移动采购与招标网 - ${types[type]}`,
        link: `${baseUrl}/#/biddingProcurementBulletin`,
        item: items,
    };
}

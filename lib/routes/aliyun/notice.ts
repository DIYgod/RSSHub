import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const typeMap = {
    0: 'all',
    1: 'loss',
    2: 'security',
    3: 'record',
    4: 'other',
};

const rootUrl = 'https://cn.aliyun.com';
const apiUrl = 'https://t.aliyun.com/abs/bulletin';
const headers = {
    origin: rootUrl,
    referer: `${rootUrl}/notice/list`,
};

export const route: Route = {
    path: '/notice/:type?',
    categories: ['programming'],
    example: '/aliyun/notice',
    parameters: { type: 'N' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '公告',
    maintainers: ['muzea'],
    handler,
    description: `| 类型     | type |
| -------- | ---- |
| 全部     |      |
| 升级公告 | 1    |
| 安全公告 | 2    |
| 备案公告 | 3    |
| 其他     | 4    |`,
};

function getNotice(item) {
    const link = `${rootUrl}/notice/detail?notice-id=${item.bulletinId}`;
    return cache.tryGet(link, async () => {
        const response = await ofetch(`${apiUrl}/bulletinDetail`, {
            headers,
            query: { id: item.bulletinId, language: 'zh', website: 'cn' },
        });
        const info = response.data?.info;
        if (!response.data?.success || !info) {
            throw new Error(`Unable to retrieve Aliyun notice ${item.bulletinId}: ${response.message || response.data?.message || 'missing notice details'}`);
        }
        const detail = info.detailList?.[0];
        const publishTime = detail?.publishTime ?? info.publishTime ?? item.publishTime;
        return {
            title: detail?.title || info.title || item.title,
            link,
            pubDate: publishTime ? parseDate(publishTime, 'x') : undefined,
            description: detail?.contentHtml || item.content,
        };
    });
}

async function handler(ctx) {
    const type = typeMap[ctx.req.param('type')] || typeMap[0];
    const limit = 12;
    const response = await ofetch(`${apiUrl}/bulletinQuery`, {
        headers,
        query: { pageNo: 1, pageSize: limit, bulletinType: type === 'all' ? undefined : type },
    });
    if (!response.data?.success || !Array.isArray(response.data.info)) {
        throw new Error(`Unable to retrieve Aliyun notices: ${response.message || response.data?.message || 'missing notice list'}`);
    }
    return {
        title: '阿里云公告',
        link: `${rootUrl}/notice/list?notice-type=${type}`,
        item: await pMap(response.data.info, getNotice, { concurrency: 3 }),
    };
}

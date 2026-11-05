import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const typeMap = {
    0: '全部',
    1: '其他',
    2: '规则变更',
};

export const route: Route = {
    path: '/notice/:type?',
    categories: ['programming'],
    example: '/dangdang/notice/1',
    parameters: { type: '公告分类，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '公告',
    maintainers: ['353325487'],
    handler,
    description: `| 类型     | type |
| -------- | ---- |
| 全部     | 0    |
| 其他     | 1    |
| 规则变更 | 2    |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? '0';
    if (!Object.hasOwn(typeMap, type)) {
        throw new InvalidParameterError('Invalid notice type: use 0 (all), 1 (other), or 2 (rule changes).');
    }
    const url = `https://open.dangdang.com/op-api/developer-platform/document/menu/list?categoryId=3&type=${type > 0 ? typeMap[type] : ''}`;
    const response = await got({ method: 'get', url });

    const list: Array<DataItem & { source: string }> = response.data.data.documentMenu.map((item) => ({
        title: item.title,
        description: item.type,
        documentId: item.documentId,
        source: `https://open.dangdang.com/op-api/developer-platform/document/info/get?document_id=${item.documentId}`,
        link: `https://open.dangdang.com/home/notice/message/1/${item.documentId}`,
        pubDate: item.modifyTime ? timezone(parseDate(item.modifyTime), 8) : undefined,
    }));

    const result = await pMap(
        list,
        (item) =>
            cache.tryGet(item.source, async () => {
                const itemResponse = await got(item.source);
                item.description = itemResponse.data.data.documentContentList[0].content;
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: `当当开放平台 - ${typeMap[type] || typeMap[0]}`,
        link: 'https://open.dangdang.com/home/notice/message/1',
        item: result,
    };
}

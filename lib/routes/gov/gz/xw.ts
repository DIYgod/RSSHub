import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/xw/:category',
    name: '新闻',
    example: '/gov/gz/xw/gzyw',
    parameters: { category: '新闻分类' },
    radar: [
        {
            source: ['www.gz.gov.cn/xw/:category'],
        },
    ],
    maintainers: ['drgnchan'],
    handler,
    description: `| 广州要闻 | 今日头条 | 通知公告 |
| -------- | -------- | -------- |
| gzyw     | jrtt     | tzgg     |`,
};

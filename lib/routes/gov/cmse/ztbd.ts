import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/ztbd/:id',
    name: '专题报道',
    example: '/gov/cmse/ztbd/xwfbh',
    parameters: {
        id: '分类 id，见下表，可在对应分类页 URL 中找到',
    },
    description: `| 新闻发布会 | 学术大会 | 标准 | 新闻专题 |
| ---------- | -------- | ---- | -------- |
| xwfdh      | xsdh     | bz   | xwzt     |`,
    radar: [
        {
            source: ['www.cmse.gov.cn/ztbd/:id'],
        },
    ],
    maintainers: ['nczitzk'],
    handler,
};

import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/kpjy/:id',
    name: '科普教育',
    example: '/gov/cmse/kpjy/kphd',
    parameters: {
        id: '分类 id，见下表，可在对应分类页 URL 中找到',
    },
    description: `| 科普活动 | 太空课堂 | 航天知识 |
| -------- | -------- | -------- |
| kphd     | tkkt     | ttzs     |`,
    radar: [
        {
            source: ['www.cmse.gov.cn/kpjy/:id'],
        },
    ],
    maintainers: ['nczitzk'],
    handler,
};

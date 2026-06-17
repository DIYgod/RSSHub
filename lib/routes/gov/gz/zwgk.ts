import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/zwgk/:category',
    name: '政务公开',
    example: '/gov/gz/zwgk/zcjd',
    parameters: { category: '政务话你知' },
    radar: [
        {
            source: ['www.gz.gov.cn/zwgk/zcjd/zcjd'],
            target: '/zwgk/zcjd',
        },
    ],
    maintainers: ['drgnchan'],
    handler,
    description: `| 文字解读 |
| -------- |
| zcjd     |`,
};

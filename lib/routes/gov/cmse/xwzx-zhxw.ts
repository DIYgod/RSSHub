import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/xwzx/zhxw',
    name: '综合新闻',
    example: '/gov/cmse/xwzx/zhxw',
    radar: [
        {
            source: ['www.cmse.gov.cn/xwzx/zhxw'],
        },
    ],
    maintainers: ['nczitzk'],
    handler,
};

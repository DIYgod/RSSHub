import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/xwzx/yzjz',
    name: '研制进展',
    example: '/gov/cmse/xwzx/yzjz',
    radar: [
        {
            source: ['www.cmse.gov.cn/xwzx/yzjz'],
        },
    ],
    maintainers: ['nczitzk'],
    handler,
};

import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/gfgg',
    name: '官方公告',
    example: '/gov/cmse/gfgg',
    radar: [
        {
            source: ['www.cmse.gov.cn/gfgg'],
        },
    ],
    maintainers: ['nczitzk'],
    handler,
};

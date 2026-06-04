import type { Route } from '@/types';

import { handler } from './common';

export const route: Route = {
    name: '头条资讯',
    path: ['/'],
    example: '/cnbeta',
    radar: [
        {
            source: ['cnbeta.com.tw/'],
        },
    ],
    maintainers: ['kt286', 'HaitianLiu', 'nczitzk'],
    handler,
    url: 'cnbeta.com.tw',
};

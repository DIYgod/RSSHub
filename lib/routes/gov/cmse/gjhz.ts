import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/gjhz',
    name: '国际合作',
    example: '/gov/cmse/gjhz',
    radar: [
        {
            source: ['www.cmse.gov.cn/gjhz'],
        },
    ],
    maintainers: ['nczitzk'],
    handler,
};

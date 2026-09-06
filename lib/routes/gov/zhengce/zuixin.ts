import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/zuixin',
    categories: ['government'],
    example: '/gov/zhengce/zuixin',
    radar: [
        {
            source: ['www.gov.cn/zhengce/zuixin.htm', 'www.gov.cn/'],
        },
    ],
    name: '最新政策',
    maintainers: ['SettingDust', 'nczitzk'],
    handler,
    url: 'www.gov.cn/zhengce/zuixin.htm',
};

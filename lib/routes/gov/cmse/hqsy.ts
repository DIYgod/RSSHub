import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/hqsy/:id',
    name: '环球视野',
    example: '/gov/cmse/hqsy/zxdta',
    parameters: {
        id: '分类 id，见下表，可在对应分类页 URL 中找到',
    },
    description: `| 最新动态 | 美国 | 俄罗斯 | 欧洲 | 日本 | 印度 | 领域动态 |
| -------- | ---- | ------ | ---- | ---- | ---- | -------- |
| zxdta    | mg   | els    | oz   | rb   | yd   | lydt     |`,
    radar: [
        {
            source: ['www.cmse.gov.cn/hqsy/:id'],
        },
    ],
    maintainers: ['nczitzk'],
    handler,
};

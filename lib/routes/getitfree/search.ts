import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['shopping'],
    example: '/getitfree/search/windows',
    parameters: { keyword: '关键字' },
    radar: [
        {
            source: ['getitfree.cn/'],
            target: (_, url) => {
                const keyword = new URL(url).searchParams.get('s');

                return `/getitfree/search${keyword ? `/${keyword}` : ''}`;
            },
        },
    ],
    name: '搜索',
    maintainers: ['sanmmm', 'nczitzk'],
    handler,
    url: 'getitfree.cn',
};

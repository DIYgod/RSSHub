import type { Route } from '@/types';

import { getFirstPage } from './utils';

export const route: Route = {
    path: '/',
    example: '/ddosi',
    radar: [
        {
            source: ['ddosi.org/'],
            target: '',
        },
    ],
    name: '首页',
    maintainers: ['XinRoom'],
    handler,
    url: 'ddosi.org/',
};

async function handler() {
    const url = 'https://www.ddosi.org/';
    const items = await getFirstPage(url);

    return {
        title: '雨苁',
        link: url,
        item: items,
    };
}

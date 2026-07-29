import type { Route } from '@/types';

import { handler } from './category';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/leiphone',
    radar: [
        {
            source: ['leiphone.com/'],
            target: '',
        },
    ],
    name: '最新文章',
    maintainers: ['vlcheng'],
    handler,
    url: 'leiphone.com/',
};

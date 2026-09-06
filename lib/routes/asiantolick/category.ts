import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/category/:id',
    categories: ['picture'],
    example: '/asiantolick/category/90',
    parameters: {
        id: 'Category id, can be found in URL',
    },
    features: {
        nsfw: true,
    },
    radar: [
        {
            source: ['asiantolick.com/category-:id'],
            target: '/category/:id',
        },
    ],
    name: 'Category',
    maintainers: ['nczitzk'],
    handler,
    url: 'asiantolick.com/',
    description: `| Category   | id   |
| ---------- | ---- |
| Lolita     | 90   |
| Hot Sister | 91   |
| Cosplay    | 1030 |
| Sexy       | 93   |
| Others     | 94   |
| Thailand   | 99   |
| Magazine   | 100  |
| Hard Sexy  | 103  |`,
};

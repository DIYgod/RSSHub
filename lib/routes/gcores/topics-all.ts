import type { Route } from '@/types';

import { route as topicsRoute } from './topics';

export const route: Route = {
    ...topicsRoute,
    path: '/topics/recommend',
    name: '全部机组推荐',
    example: '/gcores/topics/recommend',
    parameters: undefined,
    description: undefined,
    radar: [
        {
            source: ['www.gcores.com/topics/home'],
            target: '/topics/recommend',
        },
    ],
};

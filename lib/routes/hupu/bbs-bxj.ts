import type { Route } from '@/types';

import { route as originalRoute } from './bbs';

export const route: Route = {
    ...originalRoute,
    path: '/bxj/:id?/:order?',
    radar: [],
};

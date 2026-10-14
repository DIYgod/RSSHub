import type { Route } from '@/types';

import { route as originalRoute } from './index';

export const route: Route = {
    ...originalRoute,
    path: '/dept/:category?',
    radar: [],
};

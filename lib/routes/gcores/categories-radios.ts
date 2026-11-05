import type { Route } from '@/types';
import { ViewType } from '@/types';

import { handler, route as categoriesRoute } from './categories';

export const route: Route = {
    ...categoriesRoute,
    path: '/categories/:id/radios',
    name: `${categoriesRoute.name} - 播客`,
    example: '/gcores/categories/45/radios',
    parameters: {
        id: categoriesRoute.parameters!.id,
    },
    radar: [],
    view: ViewType.Audios,
    handler: (ctx) => handler(ctx, 'radios'),
};

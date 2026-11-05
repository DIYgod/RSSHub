import type { Route } from '@/types';
import { ViewType } from '@/types';

import { handler, route as categoriesRoute } from './categories';

export const route: Route = {
    ...categoriesRoute,
    path: '/categories/:id/videos',
    name: `${categoriesRoute.name} - 视频`,
    example: '/gcores/categories/61/videos',
    parameters: {
        id: categoriesRoute.parameters!.id,
    },
    radar: [],
    view: ViewType.Videos,
    handler: (ctx) => handler(ctx, 'videos'),
};

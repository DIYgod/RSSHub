import type { Route } from '@/types';
import { ViewType } from '@/types';

import { handler, route as collectionsRoute } from './collections';

export const route: Route = {
    ...collectionsRoute,
    path: '/collections/:id/videos',
    name: `${collectionsRoute.name} - 视频`,
    example: '/gcores/collections/64/videos',
    parameters: {
        id: collectionsRoute.parameters!.id,
    },
    radar: [],
    view: ViewType.Videos,
    handler: (ctx) => handler(ctx, 'videos'),
};

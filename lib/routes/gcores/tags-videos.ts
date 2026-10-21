import type { Route } from '@/types';
import { ViewType } from '@/types';

import { handler, route as tagsRoute } from './tags';

export const route: Route = {
    ...tagsRoute,
    path: '/tags/:id/videos',
    name: `${tagsRoute.name} - 视频`,
    example: '/gcores/tags/1/videos',
    parameters: {
        id: tagsRoute.parameters!.id,
    },
    radar: [],
    view: ViewType.Videos,
    handler: (ctx) => handler(ctx, 'videos'),
};

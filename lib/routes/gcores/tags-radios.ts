import type { Route } from '@/types';
import { ViewType } from '@/types';

import { handler, route as tagsRoute } from './tags';

export const route: Route = {
    ...tagsRoute,
    path: '/tags/:id/radios',
    name: `${tagsRoute.name} - 播客`,
    example: '/gcores/tags/1/radios',
    parameters: {
        id: tagsRoute.parameters!.id,
    },
    radar: [],
    view: ViewType.Audios,
    handler: (ctx) => handler(ctx, 'radios'),
};

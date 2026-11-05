import type { Route } from '@/types';
import { ViewType } from '@/types';

import { handler, route as collectionsRoute } from './collections';

export const route: Route = {
    ...collectionsRoute,
    path: '/collections/:id/radios',
    name: `${collectionsRoute.name} - 播客`,
    example: '/gcores/collections/64/radios',
    parameters: {
        id: collectionsRoute.parameters!.id,
    },
    radar: [],
    view: ViewType.Audios,
    handler: (ctx) => handler(ctx, 'radios'),
};

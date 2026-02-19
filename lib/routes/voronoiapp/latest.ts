import type { Data, Route } from '@/types';

import { CategoryParam, CommonDataProperties, CommonRouteProperties, getPostItems } from './common';

export const route: Route = {
    ...CommonRouteProperties,
    name: 'Latest Posts',
    path: '/latest/:category?',
    radar: [
        {
            source: ['www.voronoiapp.com/posts/latest'],
            target: '/latest',
        },
    ],
    example: '/voronoiapp/latest',
    parameters: {
        category: CategoryParam,
    },
    handler: async (ctx) => {
        const { category = '' } = ctx.req.param();
        const items = await getPostItems({ swimlane: 'LATEST', category: category === '' ? undefined : category });
        return {
            ...CommonDataProperties,
            title: `Voronoi Latest Posts${category ? ` - ${category}` : ''}`,
            link: 'https://www.voronoiapp.com/latest',
            item: items,
        } as Data;
    },
};

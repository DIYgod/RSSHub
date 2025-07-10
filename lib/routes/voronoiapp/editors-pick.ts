import type { Data, Route } from '@/types';
import { getPostItems, CategoryParam, CommonRouteProperties, CommonDataProperties } from './common';

export const route: Route = {
    ...CommonRouteProperties,
    name: "Editor's Pick Posts",
    path: '/editors-pick/:category?',
    radar: [
        {
            source: ['www.voronoiapp.com/posts/editors-pick'],
            target: '/editors-pick',
        },
    ],
    example: '/voronoiapp/editors-pick',
    parameters: {
        category: CategoryParam,
    },
    handler: async (ctx) => {
        const { category = '' } = ctx.req.param();
        const items = await getPostItems({ swimlane: 'CURATED', category: category === '' ? undefined : category });
        return {
            ...CommonDataProperties,
            title: `Voronoi Editor's Pick Posts${category ? ` - ${category}` : ''}`,
            link: 'https://www.voronoiapp.com/editors-pick',
            item: items,
        } as Data;
    },
};

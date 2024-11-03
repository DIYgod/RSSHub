import type { Data, Route } from '@/types';
import { getPostItems, CategoryParam, CommonRouteProperties, CommonDataProperties } from './common';

export const route: Route = {
    ...CommonRouteProperties,
    name: 'Home Posts',
    path: '/home/:category?',
    description: 'This is the home page of Voronoi App',
    radar: [
        {
            source: ['www.voronoiapp.com', 'www.voronoiapp.com/posts/voronoi'],
            target: '/home',
        },
    ],
    example: '/voronoiapp/home',
    parameters: {
        category: CategoryParam,
    },
    handler: async (ctx) => {
        const { category = '' } = ctx.req.param();
        const items = await getPostItems({ feed: 'VORONOI', category: category === '' ? undefined : category });
        return {
            ...CommonDataProperties,
            title: `Voronoi Home Posts${category ? ` - ${category}` : ''}`,
            link: 'https://www.voronoiapp.com',
            item: items,
        } as Data;
    },
};

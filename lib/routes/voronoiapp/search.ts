import type { Route } from '@/types';

import { CommonDataProperties, CommonRouteProperties, getPostItems } from './common';

export const route: Route = {
    ...CommonRouteProperties,
    name: 'Search Keyword Posts',
    path: '/search/:keyword',
    radar: [
        {
            source: ['www.voronoiapp.com/explore'],
            target: '/search/:keyword',
        },
    ],
    example: '/voronoiapp/search/china',
    parameters: {
        keyword: 'The keyword to search for',
    },
    handler: async (ctx) => {
        const { keyword } = ctx.req.param();
        const items = await getPostItems({ search: keyword });
        return {
            ...CommonDataProperties,
            title: `Voronoi Posts for "${keyword}"`,
            link: `https://www.voronoiapp.com/explore?search=${encodeURIComponent(keyword)}`,
            item: items,
        };
    },
};

import type { Data, Route } from '@/types';
import { CommonRouteProperties, getPostItems } from './common';

export const route: Route = {
    ...CommonRouteProperties,
    name: 'Search Keyword Posts',
    path: '/search/:keyword',
    radar: [
        {
            source: ['www.voronoiapp.com/explore'],
            // 新版本中貌似不再支持 function 形式的 target
            target: (_, url) => {
                const parsedURL = new URL(url);
                const keyword = parsedURL.searchParams.get('search');
                return `/search/${keyword}`;
            },
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
            title: `Voronoi Posts for "${keyword}"`,
            link: `https://www.voronoiapp.com/explore?search=${encodeURIComponent(keyword)}`,
            item: items,
            allowEmpty: true,
        } as Data;
    },
};

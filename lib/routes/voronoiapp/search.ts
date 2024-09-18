import type { Data, Route } from '@/types';
import { getPostItems } from './base';

export const route: Route = {
    name: 'Search Keyword Posts',
    url: 'voronoiapp.com',
    path: '/search/:keyword',
    categories: ['reading'],
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
    maintainers: ['cesaryuan'],
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

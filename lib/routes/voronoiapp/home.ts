import type { Data, Route } from '@/types';
import { getPostItems, CategoryParam, ValidCategory } from './base';

export const route: Route = {
    name: 'Home Posts',
    url: 'voronoiapp.com',
    path: '/home/:category?',
    categories: ['reading'],
    description: 'This is the home page of Voronoi App',
    radar: [
        {
            source: ['www.voronoiapp.com', 'www.voronoiapp.com/posts/voronoi'],
            target: '/home',
        },
    ],
    maintainers: ['cesaryuan'],
    example: '/voronoiapp/home',
    parameters: {
        category: CategoryParam,
    },
    handler: async (ctx) => {
        const { category = '' } = ctx.req.param();
        if (!ValidCategory.includes(category)) {
            throw new Error(`Invalid category: ${category}`);
        }
        const items = await getPostItems({ feed: 'VORONOI', category: category === '' ? undefined : category });
        return {
            title: 'Voronoi Home Posts',
            link: 'https://www.voronoiapp.com',
            item: items,
            allowEmpty: true,
        } as Data;
    },
};

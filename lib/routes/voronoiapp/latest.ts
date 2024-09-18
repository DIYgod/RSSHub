import type { Data, Route } from '@/types';
import { getPostItems, CategoryParam, ValidCategory } from './base';

export const route: Route = {
    name: 'Latest Posts',
    url: 'voronoiapp.com',
    path: '/latest/:category?',
    categories: ['reading'],
    radar: [
        {
            source: ['www.voronoiapp.com/posts/latest'],
            target: '/latest',
        },
    ],
    maintainers: ['cesaryuan'],
    example: '/voronoiapp/latest',
    parameters: {
        category: CategoryParam,
    },
    handler: async (ctx) => {
        const { category = '' } = ctx.req.param();
        if (!ValidCategory.includes(category)) {
            throw new Error(`Invalid category: ${category}`);
        }
        const items = await getPostItems({ swimlane: 'LATEST', category: category === '' ? undefined : category });
        return {
            title: 'Voronoi Latest Posts',
            link: 'https://www.voronoiapp.com/latest',
            item: items,
            allowEmpty: true,
        } as Data;
    },
};

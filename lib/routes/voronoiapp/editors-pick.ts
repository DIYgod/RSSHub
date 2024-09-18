import type { Data, Route } from '@/types';
import { getPostItems, CategoryParam, ValidCategory } from './base';

export const route: Route = {
    name: "Editor's Pick Posts",
    url: 'voronoiapp.com',
    path: '/editors-pick/:category?',
    categories: ['reading'],
    radar: [
        {
            source: ['www.voronoiapp.com/posts/editors-pick'],
            target: '/editors-pick',
        },
    ],
    maintainers: ['cesaryuan'],
    example: '/voronoiapp/editors-pick',
    parameters: {
        category: CategoryParam,
    },
    handler: async (ctx) => {
        const { category = '' } = ctx.req.param();
        if (!ValidCategory.includes(category)) {
            throw new Error(`Invalid category: ${category}`);
        }
        const items = await getPostItems({ swimlane: 'CURATED', category: category === '' ? undefined : category });
        return {
            title: "Voronoi Editor's Pick Posts",
            link: 'https://www.voronoiapp.com/editors-pick',
            item: items,
            allowEmpty: true,
        } as Data;
    },
};

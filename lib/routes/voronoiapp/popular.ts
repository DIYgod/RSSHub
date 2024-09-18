import type { Data, Route } from '@/types';
import { CategoryParam, CommonDataProperties, CommonRouteProperties, getPostItems, TabMap, TabParam, TimeRangeParam } from './common';

export const route: Route = {
    ...CommonRouteProperties,
    name: 'Popular Posts',
    path: '/popular/:tab?/:time_range?/:category?',
    radar: [
        {
            title: 'Most Liked Posts',
            source: ['www.voronoiapp.com/posts/most-popular'],
            target: '/popular/most-popular',
        },
        {
            title: 'Most Discussed Posts',
            source: ['www.voronoiapp.com/posts/most-discussed'],
            target: '/popular/most-discussed',
        },
        {
            title: 'Most Viewed Posts',
            source: ['www.voronoiapp.com/posts/most-viewed'],
            target: '/popular/most-viewed',
        },
    ],
    parameters: {
        tab: TabParam,
        time_range: TimeRangeParam,
        category: CategoryParam,
    },
    example: '/voronoiapp/popular/most-popular/MONTH',
    handler: async (ctx) => {
        const { tab = 'most-popular', time_range = 'MONTH', category = '' } = ctx.req.param();
        if (!TabMap[tab.toLowerCase()]) {
            throw new Error(`Invalid tab: ${tab}`);
        }
        const items = await getPostItems({
            swimlane: 'POPULAR',
            tab: TabMap[tab.toLowerCase()],
            time_range: time_range === '' ? undefined : time_range.toUpperCase(),
            category: category === '' ? undefined : category,
        });
        return {
            ...CommonDataProperties,
            title: `Voronoi ${TabParam.options.find((option) => option.value === tab.toLowerCase())?.label} Posts in ${TimeRangeParam.options.find((option) => option.value === time_range.toUpperCase())?.label}${category ? ` - ${category}` : ''}`,
            link: `https://www.voronoiapp.com/posts/${tab}`,
            item: items,
        } as Data;
    },
};

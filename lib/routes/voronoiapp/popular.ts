import type { Data, Route } from '@/types';
import { CategoryParam, getPostItems, ValidTimeRange, ValidCategory } from './base';
const TabMap = {
    'most-popular': 'POPULAR',
    'most-discussed': 'DISCUSSED',
    'most-viewed': 'VIEWED',
};

export const route: Route = {
    name: 'Popular Posts',
    url: 'voronoiapp.com',
    path: '/popular/:tab?/:time_range?/:category?',
    categories: ['reading'],
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
        tab: {
            description: 'The tab to get the popular posts from.',
            default: 'most-popular',
            options: [
                {
                    value: 'most-popular',
                    label: 'Most Liked',
                },
                {
                    value: 'most-discussed',
                    label: 'Most Discussed',
                },
                {
                    value: 'most-viewed',
                    label: 'Most Viewed',
                },
            ],
        },
        time_range: {
            description: 'Time range between which the posts are popular.',
            default: 'MONTH',
            options: [
                {
                    value: 'WEEK',
                    label: 'Last 7 days',
                },
                {
                    value: 'MONTH',
                    label: 'Last 30 days',
                },
                {
                    value: 'YEAR',
                    label: 'Last 12 months',
                },
                {
                    value: '',
                    label: 'All time',
                },
            ],
        },
        category: CategoryParam,
    },
    maintainers: ['cesaryuan'],
    example: '/voronoiapp/popular/most-popular/MONTH',
    handler: async (ctx) => {
        const { tab = 'most-popular', time_range = 'MONTH', category = '' } = ctx.req.param();
        if (!TabMap[tab]) {
            throw new Error(`Invalid tab: ${tab}`);
        }
        if (!ValidTimeRange.includes(time_range.toUpperCase())) {
            throw new Error(`Invalid time range: ${time_range}`);
        }
        if (!ValidCategory.includes(category)) {
            throw new Error(`Invalid category: ${category}`);
        }
        const items = await getPostItems({
            swimlane: 'POPULAR',
            tab: TabMap[tab],
            time_range: time_range === '' ? undefined : time_range.toUpperCase(),
            category: category === '' ? undefined : category,
        });
        return {
            title: 'Voronoi Popular Posts',
            link: `https://www.voronoiapp.com/posts/${tab}`,
            item: items,
            allowEmpty: true,
        } as Data;
    },
};

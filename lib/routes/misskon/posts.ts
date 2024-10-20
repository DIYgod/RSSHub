import { Route } from '@/types';
import { ENDPOINT, getPosts } from './utils';

export const route: Route = {
    path: '/posts/:routeParams?',
    categories: ['picture'],
    example: '/misskon/posts/search=video&tags_exclude=353,3100&per_page=5',
    parameters: { routeParams: 'Additional parameters for filtering posts, refer to [WordPress API Reference](https://developer.wordpress.org/rest-api/reference/posts/#arguments) for details.' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['misskon.com/'],
            target: '/posts',
        },
    ],
    name: 'Posts',
    maintainers: ['Urabartin'],
    handler: async (ctx) => {
        const { routeParams = '' } = ctx.req.param();
        return {
            title: `MissKON - ${routeParams || 'Posts'}`,
            link: `${ENDPOINT}/posts` + (routeParams ? `?${routeParams}` : ''),
            item: await getPosts(routeParams),
        };
    },
};

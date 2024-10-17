import { Route } from '@/types';
import { getPostItems } from './utils';

export const route: Route = {
    path: '/search/:kw',
    categories: ['picture'],
    example: '/misskon/search/video',
    parameters: { kw: 'Keyword for searching' },
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
            source: ['misskon.com/?s=:kw'],
            target: '/search/:kw',
        },
    ],
    name: 'Search',
    maintainers: ['Urabartin'],
    handler: async (ctx) => {
        const { kw } = ctx.req.param();
        const searchLink = `https://misskon.com/?s=${kw}`;
        return await getPostItems(searchLink);
    },
};

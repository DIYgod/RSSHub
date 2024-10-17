import { Route } from '@/types';
import { getPostItems } from './utils';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['picture'],
    example: '/misskon/tag/cosplay',
    parameters: { tag: 'Any tag that exists in MissKon' },
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
            source: ['misskon.com/tag/:tag/'],
            target: '/tag/:tag',
        },
    ],
    name: 'Tag',
    maintainers: ['Urabartin'],
    handler: async (ctx) => {
        const { tag } = ctx.req.param();
        const tagLink = `https://misskon.com/tag/${tag}/`;
        return await getPostItems(tagLink);
    },
};

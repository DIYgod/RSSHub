import type { Route } from '@/types';

import { getPosts, getTags } from './utils';

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
        nsfw: true,
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
        const tagData = await getTags(tag);
        const searchParams = new URLSearchParams();
        searchParams.set('tags', tagData.id);
        const items = await getPosts(searchParams.toString());
        return {
            title: `MissKON - ${tagData.name}`,
            link: tagData.link,
            description: tagData.description,
            item: items,
        };
    },
};

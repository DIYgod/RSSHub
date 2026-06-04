import type { Route } from '@/types';

import { getPosts, getTagInfo, SUB_URL } from './utils';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['picture'],
    example: '/8kcos/tag/cosplay',
    parameters: { tag: '标签名' },
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
            source: ['8kcosplay.com/tag/:tag'],
        },
    ],
    name: '标签',
    maintainers: ['KotoriK'],
    handler,
    url: '8kcosplay.com/',
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit') ?? 10, 10);
    const tag = ctx.req.param('tag');
    const tagInfo = await getTagInfo(tag);
    const items = await getPosts(limit, { tags: tagInfo.id });

    return {
        title: `${tagInfo.title}`,
        link: `${SUB_URL}/tag/${tag}/`,
        item: items,
    };
}

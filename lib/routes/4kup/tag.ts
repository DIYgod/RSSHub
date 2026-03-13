import type { Route } from '@/types';
import got from '@/utils/got';

import loadArticle from './article';
import { SUB_NAME_PREFIX, SUB_URL } from './const';
import type { WPPost } from './types';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['picture'],
    example: '/4kup/tag/asian',
    parameters: { tag: 'Tag' },
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
            source: ['4kup.net/tag/:tag'],
            target: '/tag/:tag',
        },
    ],
    name: 'Tag',
    maintainers: ['AiraNadih'],
    handler,
    url: '4kup.net/',
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit')) || 20;
    const tag = ctx.req.param('tag');
    const tagUrl = `${SUB_URL}tag/${tag}/`;

    const {
        data: [{ id: tagId }],
    } = await got(`${SUB_URL}wp-json/wp/v2/tags?slug=${tag}`);
    const { data: posts } = await got(`${SUB_URL}wp-json/wp/v2/posts?tags=${tagId}&per_page=${limit}`);

    return {
        title: `${SUB_NAME_PREFIX} - Tag: ${tag}`,
        link: tagUrl,
        item: posts.map((post) => loadArticle(post as WPPost)),
    };
}

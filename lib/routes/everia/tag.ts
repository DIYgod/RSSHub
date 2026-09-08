import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { loadArticle } from './article';
import { SUB_NAME_PREFIX, SUB_URL } from './const';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['picture'],
    example: '/everia/tag/hinatazaka46-日向坂46',
    parameters: {
        tag: 'Tag of the image stream',
    },
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
            source: ['everia.club/tag/:tag'],
            target: '/tag/:tag',
        },
    ],
    name: 'Images with tag',
    maintainers: ['KTachibanaM', 'AiraNadih'],
    handler,
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit')) || 20;
    const tag = ctx.req.param('tag');
    const tagUrl = `${SUB_URL}tag/${tag}/`;

    const tagId = await cache.tryGet(`everia:tag:${tag}`, async () => {
        const { data: tags } = await got(`${SUB_URL}wp-json/wp/v2/tags?slug=${tag}`);
        if (!tags.length) {
            throw new InvalidParameterError(`Tag not found: ${tag}`);
        }
        return tags[0].id as number;
    });
    const { data: posts } = await got(`${SUB_URL}wp-json/wp/v2/posts?tags=${tagId}&per_page=${limit}&_embed`);

    return {
        title: `${SUB_NAME_PREFIX} - Tag: ${tag}`,
        link: tagUrl,
        item: posts.map((post) => loadArticle(post)),
    };
}

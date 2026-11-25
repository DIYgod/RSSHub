import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';

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
    const limit = Math.min(getRouteLimit(ctx, 20), 100);
    const tag = ctx.req.param('tag');
    const tagUrl = `${SUB_URL}tag/${encodeURIComponent(tag)}/`;

    const tagId = await cache.tryGet(`everia:tag:${tag}`, async (): Promise<number> => {
        const { data: tags } = await got(`${SUB_URL}wp-json/wp/v2/tags`, { searchParams: { slug: tag } });
        if (!tags.length) {
            throw new InvalidParameterError(`Tag not found: ${tag}`);
        }
        return tags[0].id;
    });
    const { data: posts } = await got(`${SUB_URL}wp-json/wp/v2/posts?tags=${tagId}&per_page=${limit}&_embed`);

    return {
        title: `${SUB_NAME_PREFIX} - Tag: ${tag}`,
        link: tagUrl,
        item: posts.map((post) => loadArticle(post)),
    };
}

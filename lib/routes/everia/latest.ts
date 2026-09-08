import type { Route } from '@/types';
import got from '@/utils/got';

import { loadArticle } from './article';
import { SUB_NAME_PREFIX, SUB_URL } from './const';

export const route: Route = {
    path: '/',
    categories: ['picture'],
    example: '/everia',
    parameters: {},
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
            source: ['everia.club/'],
            target: '',
        },
    ],
    name: 'Latest',
    maintainers: ['KTachibanaM', 'AiraNadih'],
    handler,
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit')) || 20;
    const { data: posts } = await got(`${SUB_URL}wp-json/wp/v2/posts?per_page=${limit}&_embed`);

    return {
        title: `${SUB_NAME_PREFIX} - Latest`,
        link: SUB_URL,
        item: posts.map((post) => loadArticle(post)),
    };
}

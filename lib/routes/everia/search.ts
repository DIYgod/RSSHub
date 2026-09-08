import type { Route } from '@/types';
import got from '@/utils/got';

import { loadArticle } from './article';
import { SUB_NAME_PREFIX, SUB_URL } from './const';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['picture'],
    example: '/everia/search/日向坂46',
    parameters: { keyword: 'Keyword' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Search',
    maintainers: ['KTachibanaM', 'AiraNadih'],
    handler,
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit')) || 20;
    const keyword = ctx.req.param('keyword');
    const url = `${SUB_URL}?s=${keyword}`;

    const { data: posts } = await got(`${SUB_URL}wp-json/wp/v2/posts?search=${keyword}&per_page=${limit}&_embed`);

    return {
        title: `${SUB_NAME_PREFIX} - Search: ${keyword}`,
        link: url,
        item: posts.map((post) => loadArticle(post)),
    };
}

import type { Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';

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
    const limit = Math.min(getRouteLimit(ctx, 20), 100);
    const keyword = ctx.req.param('keyword');
    const url = new URL(SUB_URL);
    url.searchParams.set('s', keyword);

    const { data: posts } = await got(`${SUB_URL}wp-json/wp/v2/posts`, { searchParams: { search: keyword, per_page: limit, _embed: '' } });

    return {
        title: `${SUB_NAME_PREFIX} - Search: ${keyword}`,
        link: url.href,
        item: posts.map((post) => loadArticle(post)),
    };
}

import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { BASE_URL, enhanceItemsWithSummaries, parseArticles } from './utils';

export const route: Route = {
    path: '/tag/:tag/:sort?',
    categories: ['programming'],
    example: '/dailypush/tag/backend/trending',
    parameters: {
        tag: { description: 'Tag name' },
        sort: {
            description: 'Sort order: `trending` (default) or `latest`',
            default: 'trending',
            options: [
                { value: 'trending', label: 'Trending' },
                { value: 'latest', label: 'Latest' },
            ],
        },
    },
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
            source: ['dailypush.dev/:tag/trending', 'dailypush.dev/:tag/latest', 'dailypush.dev/:tag'],
            target: '/tag/:tag/:sort?',
        },
    ],
    name: 'Tag',
    maintainers: ['TheGeeKing'],
    handler,
};

async function handler(ctx) {
    const { tag, sort = 'trending' } = ctx.req.param();
    const url = `${BASE_URL}/${tag}/${sort}`;

    const response = await ofetch(url);
    const $ = load(response);

    const list = parseArticles($, BASE_URL);
    const items = await enhanceItemsWithSummaries(list);

    const pageTitle = $('title').text() || `DailyPush - ${tag.charAt(0).toUpperCase() + tag.slice(1)}`;

    return {
        title: pageTitle,
        link: url,
        item: items,
    };
}

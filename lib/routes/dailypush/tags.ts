import { load } from 'cheerio';

import type { Route } from '@/types';
import { getPlaywrightPage } from '@/utils/playwright';

import { BASE_URL, enhanceItemsWithSummaries, fetchPageHtml, parseArticles } from './utils';

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
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['dailypush.dev/backend'],
            target: '/tag/backend/trending',
        },
        {
            source: ['dailypush.dev/:tag/trending'],
            target: '/tag/:tag/trending',
        },
        {
            source: ['dailypush.dev/:tag/latest'],
            target: '/tag/:tag/latest',
        },
    ],
    name: 'Tag',
    maintainers: ['TheGeeKing'],
    handler,
};

async function handler(ctx) {
    const { tag, sort = 'trending' } = ctx.req.param();
    const url = `${BASE_URL}/${tag}/${sort}`;

    const { context, destroy } = await getPlaywrightPage(url, { noGoto: true, closeTimeout: 0 });
    try {
        const html = await fetchPageHtml(context, url, 'article');
        const $ = load(html);
        const list = parseArticles($, BASE_URL);
        const orderedList = list;
        const candidates = orderedList;
        const items = await enhanceItemsWithSummaries(context, candidates);

        const pageTitle = $('title').text() || `DailyPush - ${tag.charAt(0).toUpperCase() + tag.slice(1)}`;

        return {
            title: pageTitle,
            link: url,
            item: items,
        };
    } finally {
        await destroy();
    }
}

import { load } from 'cheerio';

import type { Route } from '@/types';
import { getPlaywrightPage } from '@/utils/playwright';

import { BASE_URL, enhanceItemsWithSummaries, fetchPageHtml, parseArticles } from './utils';

export const route: Route = {
    path: '/:sort?',
    categories: ['programming'],
    example: '/dailypush/latest',
    parameters: {
        sort: {
            description: 'Sort order: `` (trending, default) or `latest`',
            default: '',
            options: [
                { value: '', label: 'Trending' },
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
    // Radar's client preserves legacy array tails when it merges remote sources.
    radar: [
        {
            source: ['dailypush.dev/', 'dailypush.dev/', 'dailypush.dev/'],
            target: '/',
        },
        {
            source: ['dailypush.dev/latest', 'dailypush.dev/latest', 'dailypush.dev/latest'],
            target: '/latest',
        },
    ],
    name: 'All',
    maintainers: ['TheGeeKing'],
    handler,
};

async function handler(ctx) {
    const { sort = '' } = ctx.req.param();
    const url = sort ? `${BASE_URL}/${sort}` : BASE_URL;

    const { context, destroy } = await getPlaywrightPage(url, { noGoto: true, closeTimeout: 0 });
    try {
        const html = await fetchPageHtml(context, url, 'article');
        const $ = load(html);
        const list = parseArticles($, BASE_URL);
        const orderedList = list;
        const candidates = orderedList;
        const items = await enhanceItemsWithSummaries(context, candidates);

        const pageTitle = $('title').text() || 'DailyPush - All';

        return {
            title: pageTitle,
            link: url,
            item: items,
        };
    } finally {
        await destroy();
    }
}

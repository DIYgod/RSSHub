import { load } from 'cheerio';

import type { Route } from '@/types';
import playwright from '@/utils/playwright';

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
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['dailypush.dev/', 'dailypush.dev/latest'],
            target: '/',
        },
    ],
    name: 'All',
    maintainers: ['TheGeeKing'],
    handler,
};

async function handler(ctx) {
    const { sort = '' } = ctx.req.param();
    const url = sort ? `${BASE_URL}/${sort}` : BASE_URL;

    const browser = await playwright();
    try {
        const html = await fetchPageHtml(browser, url, 'article');
        const $ = load(html);
        const list = parseArticles($, BASE_URL);
        const items = await enhanceItemsWithSummaries(browser, list);

        const pageTitle = $('title').text() || 'DailyPush - All';

        return {
            title: pageTitle,
            link: url,
            item: items,
        };
    } finally {
        await browser.close();
    }
}

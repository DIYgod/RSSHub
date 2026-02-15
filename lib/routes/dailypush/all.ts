import { load } from 'cheerio';

import type { Route } from '@/types';
import { getPuppeteerPage } from '@/utils/puppeteer';

import { BASE_URL, enhanceItemsWithSummaries, parseArticles } from './utils';

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

    const { page, destory } = await getPuppeteerPage(url, {
        onBeforeLoad: async (page) => {
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' ? request.continue() : request.abort();
            });
        },
    });
    try {
        const html = await page.content();
        const $ = load(html);

        const list = parseArticles($, BASE_URL);
        const items = await enhanceItemsWithSummaries(list);

        const pageTitle = $('title').text() || 'DailyPush - All';

        return {
            title: pageTitle,
            link: url,
            item: items,
        };
    } finally {
        await destory();
    }
}

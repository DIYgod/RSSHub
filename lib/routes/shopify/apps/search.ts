import { load } from 'cheerio';
import type { Context } from 'hono';
import { FetchError } from 'ofetch';

import type { Data, DataItem, Route } from '@/types';
import got from '@/utils/got';
import { getPlaywrightPage } from '@/utils/playwright';

import { baseURL } from './const';

export const route: Route = {
    path: '/apps/search/:q',
    example: '/shopify/apps/search/flow',
    parameters: { q: '需要搜索的 App' },
    name: 'App store search',
    maintainers: ['PrintNow'],
    handler,
    radar: [],
    features: { requirePuppeteer: true },
};

async function loadSearch(q: string): Promise<string> {
    try {
        const response = await got.get(`${baseURL}/search`, {
            searchParams: {
                q,
            },
            headers: {
                accept: 'text/html, application/xhtml+xml',
                'accept-language': 'en-US;q=0.9',
                'turbo-frame': 'search_page',
                dnt: '1',
            },
        });

        return response.data;
    } catch (error) {
        if (!(error instanceof FetchError) || error.response?.status !== 429) {
            throw error;
        }
        const url = new URL('/search', baseURL);
        url.searchParams.set('q', q);
        const { page, destroy } = await getPlaywrightPage('about:blank', { noGoto: true, javaScriptEnabled: false, closeTimeout: 0 });
        try {
            await page.setExtraHTTPHeaders({ 'turbo-frame': 'search_page', 'accept-language': 'en-US;q=0.9' });
            await page.route('**/*', (route) => {
                const request = route.request();
                return request.resourceType() === 'document' && new URL(request.url()).hostname === new URL(baseURL).hostname ? route.continue() : route.abort();
            });
            const response = await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
            if (!response?.ok()) {
                throw new Error(`Shopify App Store search returned HTTP ${response?.status() ?? 'unknown'}`, { cause: error });
            }
            return await page.content();
        } finally {
            await destroy();
        }
    }
}

async function handler(ctx: Context): Promise<Data> {
    const { q = '' } = ctx.req.param();
    const htmlContent = await loadSearch(q);
    const $ = load(htmlContent);

    const items = $('.search-results-component div[data-controller="app-card"]')
        .toArray()
        .map((item) => {
            const handle = $(item).attr('data-app-card-handle-value');

            const appInfo = $(item).find('div.tw-self-stretch');

            const rattingMatch = appInfo
                .find('span')
                .text()
                .match(/\d\.\d/);
            const rattingCountMatch = appInfo.find('span + span.tw-sr-only').text().match(/\d+/);

            const description = $(item).find('div.tw-text-fg-secondary:not(.tw-mb-md)').eq(1).text().trim();

            const result: DataItem = {
                title: $(item).attr('data-app-card-name-value') ?? '',
                link: `${baseURL}/${handle}`,
                description,
                image: $(item).attr('data-app-card-icon-url-value'),
                _extra: {
                    handle,
                    description,
                    built_for_shopify: $(item).find('span.built-for-shopify-badge').length > 0,
                    ratting: rattingMatch ? Number(rattingMatch[0]) : 0,
                    ratting_count: rattingCountMatch ? Number(rattingCountMatch[0]) : 0,
                },
            };

            return result;
        });

    return {
        title: `Search results for "${q}" – Shopify App Store`,
        link: `https://apps.shopify.com/search?q=${q}`,
        // description: `Search results for "${q}" – Shopify App Store`,
        language: 'en-us',
        item: items,
    };
}

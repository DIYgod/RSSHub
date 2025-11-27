import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import got from '@/utils/got';

import { baseURL } from './const';

export const route: Route = {
    path: '/apps/search/:q',
    example: '/shopify/apps/search/flow',
    parameters: { q: '需要搜索的 App' },
    name: 'App store search',
    maintainers: ['PrintNow'],
    handler,
    radar: [
        {
            source: ['apps.shopify.com/search'],
            target: (_params, url) => {
                const searchParams = new URL(url).searchParams;
                if (!searchParams.has('q')) {
                    return '';
                }
                return `/shopify/apps/search/${searchParams.get('q')}`;
            },
        },
    ],
};

async function handler(ctx: Context): Promise<Data> {
    const { q = '' } = ctx.req.param();
    const response = await got.get(`${baseURL}/search`, {
        searchParams: {
            q,
        },
        headers: {
            accept: 'text/html, application/xhtml+xml',
            'accept-language': 'en-US;q=0.9',
            'turbo-frame': 'search_page',
            referer: baseURL,
            dnt: '1',
        },
    });

    const htmlContent = await response.data;
    const $ = load(htmlContent);

    const items = $('.search-results-component div[data-controller="app-card"]')
        .toArray()
        .map((item) => {
            const handle = $(item).attr('data-app-card-handle-value');

            // const appInfo = $(item).find('div.tw-transition-colors.tw-text-fg-primary + div.tw-self-stretch');
            const appInfo = $(item).find('div.tw-self-stretch').clone();

            const rattingMatch = appInfo
                .find('span')
                .text()
                .match(/\d\.\d/);
            const rattingCountMatch = appInfo.find('span + span.tw-sr-only').text().match(/\d+/);

            const result: DataItem = {
                title: $(item).attr('data-app-card-name-value') ?? '',
                link: `${baseURL}/${handle}`,
                description: $(item).find(`div.tw-text-fg-tertiary`).first().text().trim(),
                image: $(item).attr('data-app-card-icon-url-value'),
                _extra: {
                    handle,
                    description: $(item).find(`div.tw-text-fg-tertiary`).first().text().trim(),
                    built_for_shopify: $(item).find(`span.built-for-shopify-badge`).length > 0,
                    ratting: rattingMatch ? Number.parseFloat(rattingMatch[0]) : 0,
                    ratting_count: rattingCountMatch ? Number(rattingCountMatch[0]) : 0,
                },
            };

            return result;
        });

    return {
        title: `Search results for "${q}" – Shopify App Store`,
        link: `https://apps.shopify.com/search?q=${q}`,
        // description: `Search results for "${q}" – Shopify App Store`,
        allowEmpty: true,
        language: 'en-us',
        item: items,
    };
}

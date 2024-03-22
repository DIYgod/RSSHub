import { Data, DataItem, Route } from '@/types';
import type { Context } from 'hono';
import got from '@/utils/got';
import { load } from 'cheerio';
import { baseURL } from './const';

export const route: Route = {
    path: '/apps/search/:q',
    example: '/shopify/apps/search/flow',
    parameters: { q: '需要搜索的 App' },
    name: 'Shopify App store search',
    maintainers: ['PrintNow'],
    handler,
};

async function handler(ctx?: Context): Promise<Data> {
    if (!ctx) {
        throw new Error('未传入 ctx');
    }

    const { q = '' } = ctx.req.param();
    const response = got.get(`${baseURL}/search`, {
        searchParams: {
            q,
        },
        responseType: 'text',
        headers: {
            'accept': 'text/html, application/xhtml+xml',
            'accept-language': 'en-US;q=0.9',
            'turbo-frame': 'search_page',
            'referer': baseURL,
            'dnt': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
    });

    const htmlContent = await response.text();
    const $ = load(htmlContent);

    const items = $(`.search-results-component div[data-controller="app-card"]`)
        .toArray()
        .map((item) => {
            const handle = $(item).attr(`data-app-card-handle-value`);

            // const appInfo = $(item).find(`div.tw-transition-colors.tw-text-fg-primary + div.tw-self-stretch`);
            const appInfo = $(item).find(`div.tw-self-stretch`).clone();

            const rattingMatch = appInfo.find(`span`).text().match(/\d\.\d/);
            const rattingCountMatch = appInfo.find(`span + span.tw-sr-only`).text().match(/\d+/);

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
        language: `en-US`,
        item: items,
    };
}

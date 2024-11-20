import type { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/search/:params',
    categories: ['game'],
    example: '/steam/search/sort_by=Released_DESC&tags=492&category1=10&os=linux',
    parameters: { params: 'Query parameters for a Steam Store search.' },
    radar: [
        {
            source: ['store.steampowered.com', 'store.steampowered.com/search/:params'],
        },
    ],
    name: 'Store Search',
    maintainers: ['moppman'],
    handler,
};

async function handler(ctx) {
    const query = new URLSearchParams(ctx.req.param('params'));
    const { data: html } = await got('https://store.steampowered.com/search/', {
        searchParams: query,
    });
    const $ = load(html);
    return {
        title: 'Steam search result',
        description: `Query: ${query.toString()}`,
        link: /g_strUnfilteredURL\s=\s'(.*)'/.exec(html)[1],
        item: $('#search_result_container a')
            .toArray()
            .map((a) => {
                const $el = $(a);
                const isBundle = !!$el.attr('data-ds-bundle-data');
                const isDiscounted = $el.find('.discount_original_price').length > 0;
                const hasReview = $el.find('.search_review_summary').length > 0;
                const appID: string | undefined = $el.attr('data-ds-appid');

                let desc = '';
                if (isBundle) {
                    const bundle = JSON.parse($el.attr('data-ds-bundle-data'));
                    desc += 'Bundle\n';
                    if (bundle.m_bRestrictGifting) {
                        desc += 'Restrict gifting\n';
                    }
                    desc += `Items count: ${bundle.m_rgItems.length}\n`;
                }
                if (isDiscounted) {
                    desc += `Discount: ${$el.find('.discount_pct').text().trim()}\n`;
                    desc += `Original price: ${$el.find('.discount_original_price').text().trim()}\n`;
                    desc += `Discounted price: ${$el.find('.discount_final_price').text().trim()}\n`;
                } else {
                    desc += `Price: ${$el.find('.discount_final_price').text().trim()}\n`;
                }
                if (hasReview) {
                    desc += $el.find('.search_review_summary').attr('data-tooltip-html');
                }
                return {
                    title: $el.find('span.title').text(),
                    link: $el.attr('href'),
                    description: desc.replaceAll('\n', '<br>'),
                    media: {
                        thumbnail: {
                            url: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appID}/header.jpg`,
                        },
                    },
                };
            })
            .filter((it) => it.title),
    };
}

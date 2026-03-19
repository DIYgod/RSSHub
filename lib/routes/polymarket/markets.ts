import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['finance'],
    example: '/polymarket/trending',
    parameters: {
        category: {
            description: 'Category slug, e.g. trending, breaking, politics, geopolitics, crypto, finance, iran, economy, tech, sports, culture',
            default: 'trending',
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
            source: ['polymarket.com', 'polymarket.com/:category'],
            target: '/:category',
        },
    ],
    name: 'Markets',
    url: 'polymarket.com',
    maintainers: ['heki'],
    handler,
};

// Helper function to find query with events data
function findEventsQuery(queries, category) {
    for (const query of queries) {
        const queryKey = query?.queryKey || [];
        const data = query?.state?.data;

        // Check if this query has pages with events
        if (data?.pages?.[0]?.events?.length > 0) {
            // For category pages, check if queryKey matches the category
            if (category === 'trending') {
                return data.pages;
            }
            const keyStr = JSON.stringify(queryKey);
            if (keyStr.includes(category) || keyStr.includes('markets')) {
                return data.pages;
            }
        }
    }
    return null;
}

async function handler(ctx) {
    const category = ctx.req.param('category') || 'trending';
    const baseUrl = 'https://polymarket.com';

    let url: string;
    if (category === 'breaking') {
        url = `${baseUrl}/breaking`;
    } else if (category === 'trending') {
        url = baseUrl;
    } else {
        url = `${baseUrl}/${category}`;
    }

    const response = await ofetch(url, {
        headers: {
            Accept: 'text/html',
        },
    });

    const $ = load(response);
    const nextDataScript = $('script#__NEXT_DATA__').html();

    if (!nextDataScript) {
        throw new Error('Failed to find __NEXT_DATA__');
    }

    const nextData = JSON.parse(nextDataScript);
    const queries = nextData.props.pageProps.dehydratedState.queries;

    let items: any[];

    if (category === 'breaking') {
        // Breaking page: find query with markets array
        let markets: any[] = [];
        for (const query of queries) {
            if (query?.state?.data?.markets?.length > 0) {
                markets = query.state.data.markets;
                break;
            }
        }

        items = markets.map((market) => {
            const outcomes = market.outcomePrices ? market.outcomePrices.map((price, i) => `Option ${i + 1}: ${(Number(price) * 100).toFixed(1)}%`).join(' | ') : '';

            return {
                title: market.question,
                description: `
                    <p><strong>Odds:</strong> ${outcomes}</p>
                    <p><strong>24h Change:</strong> ${market.oneDayPriceChange ? (market.oneDayPriceChange * 100).toFixed(1) + '%' : 'N/A'}</p>
                    ${market.image ? `<img src="${market.image}" alt="${market.question}" style="max-width: 100%;">` : ''}
                `,
                link: `${baseUrl}/event/${market.slug}`,
                pubDate: parseDate(market.events?.[0]?.startDate || market.updatedAt),
            };
        });
    } else {
        // Trending or category pages: find events array
        const pages = findEventsQuery(queries, category);

        if (!pages) {
            throw new Error('No events found for this category');
        }

        const events = pages[0]?.events || [];

        items = events.map((event) => {
            // Build description from markets
            const marketsHtml =
                event.markets
                    ?.slice(0, 3)
                    .map((market) => {
                        const outcomes = market.outcomes || [];
                        const prices = market.outcomePrices || [];
                        const oddsDisplay = outcomes.map((o, i) => `${o}: ${(Number(prices[i]) * 100).toFixed(1)}%`).join(' | ');
                        return `<li><strong>${market.question}</strong><br>${oddsDisplay}</li>`;
                    })
                    .join('') || '';

            return {
                title: event.title,
                description: `
                    ${event.description ? `<p>${event.description}</p>` : ''}
                    <p><strong>Volume:</strong> $${Number(event.volume || 0).toLocaleString()}</p>
                    ${event.live ? '<p>🔴 <strong>LIVE</strong></p>' : ''}
                    ${marketsHtml ? `<h4>Markets:</h4><ul>${marketsHtml}</ul>` : ''}
                    ${event.image ? `<img src="${event.image}" alt="${event.title}" style="max-width: 100%;">` : ''}
                `,
                link: `${baseUrl}/event/${event.slug}`,
                pubDate: parseDate(event.startDate || event.createdAt),
                category: event.tags?.map((t) => t.label || t) || [],
            };
        });
    }

    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

    return {
        title: `Polymarket - ${categoryName}`,
        link: url,
        item: items,
    };
}

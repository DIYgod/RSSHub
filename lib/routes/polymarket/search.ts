import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/search/:query',
    categories: ['finance'],
    example: '/polymarket/search/trump',
    parameters: {
        query: {
            description: 'Search query',
            required: true,
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
    name: 'Search',
    url: 'polymarket.com',
    maintainers: ['heki'],
    handler,
};

const API_BASE = 'https://gamma-api.polymarket.com';

interface SearchResult {
    events?: Event[];
    tags?: Array<{ id: string; label: string; slug: string; event_count?: number }>;
}

interface Event {
    id: string;
    title: string;
    slug: string;
    description?: string;
    volume?: number;
    image?: string;
    startDate?: string;
    markets?: Market[];
    tags?: Array<{ label?: string }>;
}

interface Market {
    id: string;
    question: string;
    outcomes?: string;
    outcomePrices?: string;
}

async function handler(ctx) {
    const query = ctx.req.param('query');

    const data = await ofetch<SearchResult>(`${API_BASE}/public-search`, {
        query: {
            q: query,
            limit_per_type: 30,
        },
    });

    const items: any[] = [];

    if (data.events?.length) {
        for (const event of data.events) {
            const marketsHtml =
                event.markets
                    ?.slice(0, 3)
                    .map((market) => {
                        const outcomes = market.outcomes ? JSON.parse(market.outcomes) : [];
                        const prices = market.outcomePrices ? JSON.parse(market.outcomePrices) : [];
                        const oddsDisplay = prices.length > 0 ? outcomes.map((o: string, i: number) => `${o}: ${(Number(prices[i]) * 100).toFixed(1)}%`).join(' | ') : outcomes.join(' | ') || 'N/A';
                        return `<li><strong>${market.question}</strong><br>${oddsDisplay}</li>`;
                    })
                    .join('') || '';

            items.push({
                title: event.title,
                description: `
                    ${event.description ? `<p>${event.description}</p>` : ''}
                    <p><strong>Volume:</strong> $${Number(event.volume || 0).toLocaleString()}</p>
                    ${marketsHtml ? `<h4>Markets:</h4><ul>${marketsHtml}</ul>` : ''}
                    ${event.image ? `<img src="${event.image}" alt="${event.title}" style="max-width: 100%;">` : ''}
                `,
                link: `https://polymarket.com/event/${event.slug}`,
                pubDate: parseDate(event.startDate),
                category: event.tags?.map((t) => t.label).filter(Boolean),
            });
        }
    }

    return {
        title: `Polymarket Search - ${query}`,
        link: `https://polymarket.com/search?q=${encodeURIComponent(query)}`,
        item: items,
    };
}

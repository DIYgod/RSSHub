import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/series/:slug?',
    categories: ['finance'],
    example: '/polymarket/series',
    parameters: {
        slug: {
            description: 'Series slug, e.g. nfl, nba, mlb. If omitted, lists all series.',
            default: 'all',
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
            source: ['polymarket.com/series/:slug'],
            target: '/series/:slug',
        },
    ],
    name: 'Series',
    url: 'polymarket.com',
    maintainers: ['heki'],
    handler,
};

const API_BASE = 'https://gamma-api.polymarket.com';

interface Series {
    id: string;
    title: string;
    slug: string;
    description?: string;
    image?: string;
    volume?: number;
    liquidity?: number;
    startDate?: string;
    createdAt?: string;
    updatedAt?: string;
    events?: Event[];
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
    const slug = ctx.req.param('slug');
    const limit = 20;

    if (slug) {
        // Get specific series by slug
        const data = await ofetch<Series[]>(`${API_BASE}/series`, {
            query: {
                slug,
                limit: 1,
            },
        });

        if (!data.length) {
            throw new Error('Series not found');
        }

        const series = data[0];
        const events = series.events || [];

        const items = events.map((event) => {
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

            return {
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
            };
        });

        return {
            title: `Polymarket Series - ${series.title}`,
            link: `https://polymarket.com/series/${series.slug}`,
            item: items,
        };
    } else {
        // List all series
        const data = await ofetch<Series[]>(`${API_BASE}/series`, {
            query: {
                limit,
                order: 'volume',
                ascending: false,
            },
        });

        const items = data.map((series) => ({
            title: series.title,
            description: `
                ${series.description ? `<p>${series.description}</p>` : ''}
                <p><strong>Volume:</strong> $${Number(series.volume || 0).toLocaleString()}</p>
                <p><strong>Liquidity:</strong> $${Number(series.liquidity || 0).toLocaleString()}</p>
                ${series.image ? `<img src="${series.image}" alt="${series.title}" style="max-width: 100%;">` : ''}
            `,
            link: `https://polymarket.com/series/${series.slug}`,
            pubDate: parseDate(series.createdAt),
        }));

        return {
            title: 'Polymarket - Series',
            link: 'https://polymarket.com',
            item: items,
        };
    }
}

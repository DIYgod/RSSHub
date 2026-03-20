import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/event/:slug',
    categories: ['finance'],
    example: '/polymarket/event/presidential-election-winner-2024',
    parameters: {
        slug: {
            description: 'Event slug from the URL (e.g. presidential-election-winner-2024)',
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
    radar: [
        {
            source: ['polymarket.com/event/:slug'],
            target: '/event/:slug',
        },
    ],
    name: 'Event',
    url: 'polymarket.com',
    maintainers: ['heki'],
    handler,
};

const API_BASE = 'https://gamma-api.polymarket.com';

interface Event {
    id: string;
    title: string;
    slug: string;
    description?: string;
    volume?: number;
    liquidity?: number;
    image?: string;
    startDate?: string;
    endDate?: string;
    live?: boolean;
    markets?: Market[];
    tags?: Array<{ label?: string }>;
}

interface Market {
    id: string;
    question: string;
    slug: string;
    outcomes?: string;
    outcomePrices?: string;
    volume?: string;
    image?: string;
    oneDayPriceChange?: number;
    endDate?: string;
    startDate?: string;
}

async function handler(ctx) {
    const slug = ctx.req.param('slug');

    const event = await ofetch<Event>(`${API_BASE}/events/slug/${slug}`);

    if (!event) {
        throw new Error('Event not found');
    }

    const items =
        event.markets?.map((market) => {
            const outcomes = market.outcomes ? JSON.parse(market.outcomes) : [];
            const prices = market.outcomePrices ? JSON.parse(market.outcomePrices) : [];
            const oddsDisplay = prices.length > 0 ? outcomes.map((o: string, i: number) => `${o}: ${(Number(prices[i]) * 100).toFixed(1)}%`).join(' | ') : outcomes.join(' | ') || 'N/A';

            return {
                title: market.question,
                description: `
                <p><strong>Odds:</strong> ${oddsDisplay}</p>
                <p><strong>Volume:</strong> $${Number(market.volume || 0).toLocaleString()}</p>
                ${market.oneDayPriceChange !== undefined && market.oneDayPriceChange !== null ? `<p><strong>24h Change:</strong> ${(market.oneDayPriceChange * 100).toFixed(1)}%</p>` : ''}
                ${market.image ? `<img src="${market.image}" alt="${market.question}" style="max-width: 100%;">` : ''}
            `,
                link: `https://polymarket.com/event/${event.slug}`,
                pubDate: parseDate(market.startDate || event.startDate),
                category: event.tags?.map((t) => t.label).filter(Boolean),
            };
        }) || [];

    return {
        title: event.title,
        link: `https://polymarket.com/event/${event.slug}`,
        item: items,
        description: event.description,
    };
}

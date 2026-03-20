import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/events/:tag_slug?',
    categories: ['finance'],
    example: '/polymarket/events',
    parameters: {
        tag_slug: {
            description: 'Tag slug to filter events, e.g. politics, sports, crypto. Omit for all events.',
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
            source: ['polymarket.com', 'polymarket.com/:tag_slug'],
            target: '/events/:tag_slug',
        },
    ],
    name: 'Events',
    url: 'polymarket.com',
    maintainers: ['heki'],
    handler,
};

const API_BASE = 'https://gamma-api.polymarket.com';

interface Market {
    id: string;
    question: string;
    outcomes?: string;
    outcomePrices?: string;
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

async function handler(ctx) {
    const tagSlug = ctx.req.param('tag_slug');
    const limit = 30;

    const query: Record<string, unknown> = {
        active: true,
        closed: false,
        limit,
        order: 'volume',
        ascending: false,
    };

    if (tagSlug) {
        query.tag_slug = tagSlug;
    }

    const data = await ofetch<Event[]>(`${API_BASE}/events`, { query });

    const items = data.map((event) => {
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

    const title = tagSlug ? `Polymarket Events - ${tagSlug}` : 'Polymarket Events';
    const link = tagSlug ? `https://polymarket.com/${tagSlug}` : 'https://polymarket.com';

    return {
        title,
        link,
        item: items,
    };
}

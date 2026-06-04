import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { Event } from './types';
import { GAMMA_API } from './types';
import { formatOddsDisplay } from './utils';

export const route: Route = {
    path: '/event/:slug',
    categories: ['finance'],
    example: '/polymarket/event/presidential-election-winner-2024',
    parameters: {
        slug: 'Event slug from the URL (e.g. presidential-election-winner-2024)',
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
    maintainers: ['heqi201255'],
    handler,
};

async function handler(ctx) {
    const slug = ctx.req.param('slug');

    const event = await ofetch<Event>(`${GAMMA_API}/events/slug/${slug}`);

    if (!event) {
        throw new Error('Event not found');
    }

    const items = event.markets.map((market) => ({
        title: market.question,
        description: `
            <p><strong>Odds:</strong> ${formatOddsDisplay(market)}</p>
            <p><strong>Volume:</strong> $${Number(market.volume || 0).toLocaleString()}</p>
            ${market.oneDayPriceChange ? `<p><strong>24h Change:</strong> ${(market.oneDayPriceChange * 100).toFixed(1)}%</p>` : ''}
            ${market.image ? `<img src="${market.image}" alt="${market.question}" style="max-width: 100%;">` : ''}
        `,
        link: `https://polymarket.com/event/${event.slug}`,
        pubDate: market.startDate || event.startDate ? parseDate(market.startDate || event.startDate!) : undefined,
        category: event.tags?.map((t) => t.label).filter(Boolean) as string[],
    }));

    return {
        title: event.title,
        link: `https://polymarket.com/event/${event.slug}`,
        item: items,
        description: event.description,
    };
}

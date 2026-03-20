import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { Event, Series } from './types';
import { GAMMA_API } from './types';
import { formatEventDescription } from './utils';

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
    maintainers: ['heqi201255'],
    handler,
};

async function handler(ctx) {
    const slug = ctx.req.param('slug');
    const limit = 20;

    if (slug) {
        // Get specific series by slug
        const data = await ofetch<Series[]>(`${GAMMA_API}/series`, {
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

        const items = events.map((event: Event) => ({
            title: event.title,
            description: formatEventDescription(event),
            link: `https://polymarket.com/event/${event.slug}`,
            pubDate: event.startDate ? parseDate(event.startDate) : undefined,
            category: event.tags?.map((t) => t.label).filter(Boolean) as string[],
        }));

        return {
            title: `Polymarket Series - ${series.title}`,
            link: `https://polymarket.com/series/${series.slug}`,
            item: items,
        };
    } else {
        // List all series
        const data = await ofetch<Series[]>(`${GAMMA_API}/series`, {
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
            pubDate: series.createdAt ? parseDate(series.createdAt) : undefined,
        }));

        return {
            title: 'Polymarket - Series',
            link: 'https://polymarket.com',
            item: items,
        };
    }
}

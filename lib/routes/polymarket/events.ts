import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { EventsPagination } from './types';
import { GAMMA_API } from './types';
import { formatEventDescription } from './utils';

export const route: Route = {
    path: '/events/:tagSlug?',
    categories: ['finance'],
    example: '/polymarket/events',
    parameters: {
        tagSlug: 'Tag slug to filter events, e.g. politics, sports, crypto. Omit for all events.',
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
            source: ['polymarket.com', 'polymarket.com/:tagSlug'],
            target: '/events/:tagSlug',
        },
    ],
    name: 'Events',
    url: 'polymarket.com',
    maintainers: ['heqi201255'],
    handler,
};

async function handler(ctx) {
    const tagSlug = ctx.req.param('tagSlug');
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

    const response = await ofetch<EventsPagination>(`${GAMMA_API}/events/pagination`, { query });

    const data = response.data || [];

    const items = data.map((event) => ({
        title: event.title,
        description: formatEventDescription(event),
        link: `https://polymarket.com/event/${event.slug}`,
        pubDate: event.startDate ? parseDate(event.startDate) : undefined,
        category: event.tags?.map((t) => t.label).filter(Boolean) as string[],
    }));

    return {
        title: `Polymarket Events${tagSlug ? ` - ${tagSlug}` : ''}`,
        link: tagSlug ? `https://polymarket.com/${tagSlug}` : 'https://polymarket.com',
        item: items,
    };
}

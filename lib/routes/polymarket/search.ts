import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { SearchResult } from './types';
import { GAMMA_API } from './types';
import { formatEventDescription } from './utils';

export const route: Route = {
    path: '/search/:query',
    categories: ['finance'],
    example: '/polymarket/search/trump',
    parameters: {
        query: 'Search query',
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
    maintainers: ['heqi201255'],
    handler,
};

async function handler(ctx) {
    const query = ctx.req.param('query');

    const data = await ofetch<SearchResult>(`${GAMMA_API}/public-search`, {
        query: {
            q: query,
            limit_per_type: 30,
        },
    });

    const items = (data.events || []).map((event) => ({
        title: event.title,
        description: formatEventDescription(event),
        link: `https://polymarket.com/event/${event.slug}`,
        pubDate: event.startDate ? parseDate(event.startDate) : undefined,
        category: event.tags?.map((t) => t.label).filter(Boolean) as string[],
    }));

    return {
        title: `Polymarket Search - ${query}`,
        link: `https://polymarket.com/search?q=${encodeURIComponent(query)}`,
        item: items,
    };
}

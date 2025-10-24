import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

import { parseFilterStr } from './util';

export const route: Route = {
    path: '/events/:filter?',
    name: 'Events',
    url: 'app.questn.com',
    maintainers: ['cxheng315'],
    example: '/questn/events',
    parameters: {
        filter: 'Filter string',
    },
    description: `
::: tip

Filter parameters:
- category: 100: trending, 200: newest, 300: top
- status_filter: 0: all, 100: available, 400: missed
- community_filter: 0: all community, 100: verified, 200: followed
- rewards_filter: 0: all rewards, 100: nft, 200: token, 400: whitelist
- chain_filter: 0: all chains, 1: ethereum, 56: bsc, 137: polygon, 42161: arb, 10: op, 324: zksync, 43114: avax
- search: 'Search keyword',
- count: 'Number of events to fetch',
- page: 'Page number',
:::`,
    categories: ['other'],
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
            source: ['app.questn.com/explore'],
            target: '/events/:category?/:status_filter?/:community_filter?/:reward_filter?/:chain_filter?/:search?/:count?/:page?',
        },
    ],
    handler,
};

async function handler(ctx) {
    const url = 'https://api.questn.com/consumer/explore/list/';

    const parsedFilter: { category?: string; status_filter?: string; community_filter?: string; reward_filter?: string; chain_filter?: string; search?: string; count?: string; page?: string } = parseFilterStr(
        ctx.req.param('filter')
    );

    const params = {
        category: parsedFilter.category || '200',
        status_filter: parsedFilter.status_filter || '100',
        community_filter: parsedFilter.community_filter || '0',
        rewards_filter: parsedFilter.reward_filter || '0',
        chain_filter: parsedFilter.chain_filter || '0',
        search: parsedFilter.search || '',
        count: parsedFilter.count || ctx.req.query('limit') || '20',
        page: parsedFilter.page || '1',
    };

    const response = await ofetch(`${url}?${new URLSearchParams(params)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.result.data;

    const items = data.map((item) => ({
        title: item.title,
        link: `https://app.questn.com/quest/${item.id}`,
        author: item.community_info ? item.community_info.name : '',
        guid: item.id,
        pubDate: parseDate(item.start_time * 1000),
        itunes_duration: item.end_time > 0 ? item.end_time - item.start_time : 0,
    }));

    return {
        title: 'QuestN Events',
        link: 'https://app.questn.com/explore',
        description: 'A Quest Protocol Dedicated to DePIN and AI Training',
        image: 'https://app.questn.com/static/svgs/logo-white.svg',
        logo: 'https://app.questn.com/static/svgs/logo-white.svg',
        author: 'QuestN',
        item:
            items && items.length > 0
                ? items
                : [
                      {
                          title: 'No events found',
                          description: 'No events found',
                          link: 'https://app.questn.com/explore',
                      },
                  ],
    };
}

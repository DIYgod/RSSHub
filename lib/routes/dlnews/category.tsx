import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { getList } from './utils';

const topics = {
    defi: 'DeFi',
    fintech: 'Fintech/VC/Deals',
    deals: 'Fintech/VC/Deals',
    'llama-u': 'Llama U',
    markets: 'Markets',
    'people-culture': 'People & Culture',
    regulation: 'Regulation',
    snapshot: 'Snapshot',
    web3: 'Web3',
};

export const route: Route = {
    path: '/:category?',
    radar: [
        {
            source: ['dlnews.com/articles/:category'],
            target: '/:category',
        },
    ],
    url: 'dlnews.com/articles',
    name: 'Latest News',
    maintainers: ['Rjnishant530'],
    handler,
    example: '/dlnews/people-culture',
};

async function handler(ctx: Context): Promise<Data> {
    const category = ctx.req.param('category');
    const baseUrl = 'https://www.dlnews.com';
    const nativeCategory = category === 'fintech' ? 'deals' : category;
    const requestedLimit = getRouteLimit(ctx, 15);
    const limit = ctx.req.query('sorted') === 'false' ? Math.min(15, requestedLimit) : 15;
    const list = await getList(nativeCategory, limit);
    if (ctx.req.query('sorted') !== 'false') {
        list.sort((a, b) => new Date(b.pubDate!).getTime() - new Date(a.pubDate!).getTime());
    }
    const items = list.slice(0, getRouteLimit(ctx, 15));

    return {
        title: category && Object.hasOwn(topics, category) ? `${topics[category]} : DL News` : 'DL News',
        link: `${baseUrl}/articles/${nativeCategory ? `${encodeURIComponent(nativeCategory)}/` : ''}`,
        item: items,
        description: category && Object.hasOwn(topics, category) ? `${topics[category]} : News on dlnews.com` : 'Latest News on dlnews.com',
        language: 'en-us',
    };
}

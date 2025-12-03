import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';

import { API_HOST, CDN_HOST, HOST } from './constant';
import type { PortfolioResponse } from './types';
import { customFetch, fetchPortfolioItem, parseUserData } from './utils';

export const route: Route = {
    path: ['/portfolio/:user'],
    categories: ['social-media'],
    example: '/cara/portfolio/fengz',
    parameters: { user: 'username' },
    name: 'Portfolio',
    maintainers: ['KarasuShin'],
    handler,
    radar: [
        {
            source: ['cara.app/:user', 'cara.app/:user/*'],
            target: '/portfolio/:user',
        },
    ],
};

async function handler(ctx): Promise<Data> {
    const user = ctx.req.param('user');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;
    const userInfo = await parseUserData(user);

    const api = `${API_HOST}/profiles/portfolio?id=${userInfo.id}&take=${limit}`;

    const portfolioResponse = await customFetch<PortfolioResponse>(api);

    const items = await Promise.all(portfolioResponse.data.map((item) => cache.tryGet(`${HOST}/post/${item.postId}`, async () => await fetchPortfolioItem(item)) as unknown as DataItem));

    return {
        title: `Portfolio - ${userInfo.name}`,
        link: `${HOST}/${user}/portfolio`,
        image: `${CDN_HOST}/${userInfo.photo}`,
        item: items,
    };
}

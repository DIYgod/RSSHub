import type { Data, Route } from '@/types';
import type { PortfolioResponse } from './types';
import { asyncPoolAll, customFetch, fetchPortfolioItem, parseUserData } from './utils';
import { API_HOST, CDN_HOST, HOST } from './constant';

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
    const userInfo = await parseUserData(user);

    const api = `${API_HOST}/profiles/portfolio?id=${userInfo.id}&take=15`;

    const portfolioResponse = await customFetch<PortfolioResponse>(api);

    const items = await asyncPoolAll(5, portfolioResponse.data, async (item) => await fetchPortfolioItem(item));

    return {
        title: `Portfolio - ${userInfo.name}`,
        link: `${HOST}/${user}/portfolio`,
        image: `${CDN_HOST}/${userInfo.photo}`,
        item: items,
    };
}

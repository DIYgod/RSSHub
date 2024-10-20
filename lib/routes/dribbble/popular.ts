import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/popular/:timeframe?',
    categories: ['design'],
    example: '/dribbble/popular',
    parameters: { timeframe: 'support the following values: week, month, year and ever' },
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
            source: ['dribbble.com/'],
            target: '/popular',
        },
    ],
    name: 'Popular',
    maintainers: ['DIYgod', 'loganrockmore'],
    handler,
    url: 'dribbble.com/',
};

async function handler(ctx) {
    const timeframe = ctx.req.param('timeframe');
    const url = `https://dribbble.com/shots/popular${timeframe ? `?timeframe=${timeframe}` : ''}`;

    const title = 'Dribbble - Popular Shots';

    return await utils.getData(url, title);
}

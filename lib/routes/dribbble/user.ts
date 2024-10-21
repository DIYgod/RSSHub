import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/user/:name',
    categories: ['design'],
    example: '/dribbble/user/google',
    parameters: { name: "username, available in user's homepage URL" },
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
            source: ['dribbble.com/:name'],
        },
    ],
    name: 'User (or team)',
    maintainers: ['DIYgod', 'loganrockmore'],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const url = `https://dribbble.com/${name}`;

    const title = `Dribbble - user ${name}`;

    return await utils.getData(url, title);
}

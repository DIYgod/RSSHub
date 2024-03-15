import { Route } from '@/types';
import webApiImpl from './web-api/media';

export const route: Route = {
    path: '/media/:id/:routeParams?',
    categories: ['social-media'],
    example: '/twitter/media/DIYgod',
    parameters: { id: 'username; in particular, if starts with `+`, it will be recognized as a [unique ID](https://github.com/DIYgod/RSSHub/issues/12221), e.g. `+44196397`', routeParams: 'extra parameters, see the table above.' },
    features: {
        requireConfig: [
            {
                name: 'TWITTER_USERNAME',
                description: '',
            },
            {
                name: 'TWITTER_PASSWORD',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User media',
    maintainers: ['yindaheng98', 'Rongronggg9'],
    handler,
    radar: [
        {
            source: ['twitter.com/:id/media'],
            target: '/media/:id',
        },
    ],
};

async function handler(ctx) {
    return await webApiImpl(ctx);
}

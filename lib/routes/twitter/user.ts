import { Route } from '@/types';
import webApiImpl from './web-api/user';

export const route: Route = {
    path: '/user/:id/:routeParams?',
    categories: ['social-media'],
    example: '/twitter/user/DIYgod',
    parameters: {
        id: 'username; in particular, if starts with `+`, it will be recognized as a [unique ID](https://github.com/DIYgod/RSSHub/issues/12221), e.g. `+44196397`',
        routeParams:
            'extra parameters, see the table above; particularly when `routeParams=exclude_replies`, replies are excluded; `routeParams=exclude_rts` excludes retweets,`routeParams=exclude_rts_replies` exclude replies and retweets; for default include all.',
    },
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
    name: 'User timeline',
    maintainers: ['DIYgod', 'yindaheng98', 'Rongronggg9'],
    handler,
    radar: [
        {
            source: ['twitter.com/:id'],
            target: '/user/:id',
        },
    ],
};

async function handler(ctx) {
    return await webApiImpl(ctx);
}

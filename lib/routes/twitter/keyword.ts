import { Route } from '@/types';
import webApiImpl from './web-api/search';

export const route: Route = {
    path: '/keyword/:keyword/:routeParams?',
    categories: ['social-media'],
    example: '/twitter/keyword/RSSHub',
    parameters: { keyword: 'keyword', routeParams: 'extra parameters, see the table above' },
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
    name: 'Keyword',
    maintainers: ['DIYgod', 'yindaheng98', 'Rongronggg9'],
    handler,
    radar: [
        {
            source: ['twitter.com/search'],
        },
    ],
};

async function handler(ctx) {
    return await webApiImpl(ctx);
}

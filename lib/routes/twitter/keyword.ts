import { Route } from '@/types';
import api from './api';
import utils from './utils';

export const route: Route = {
    path: '/keyword/:keyword/:routeParams?',
    categories: ['social-media'],
    example: '/twitter/keyword/RSSHub',
    parameters: { keyword: 'keyword', routeParams: 'extra parameters, see the table above' },
    features: {
        requireConfig: [
            {
                name: 'TWITTER_USERNAME',
                description: 'Please see above for details.',
            },
            {
                name: 'TWITTER_PASSWORD',
                description: 'Please see above for details.',
            },
            {
                name: 'TWITTER_COOKIE',
                description: 'Please see above for details.',
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
    const keyword = ctx.req.param('keyword');
    await api.init();
    const data = await api.getSearch(keyword);

    return {
        title: `Twitter Keyword - ${keyword}`,
        link: `https://twitter.com/search?q=${encodeURIComponent(keyword)}`,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
        allowEmpty: true,
    };
}

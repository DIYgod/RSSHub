import type { Route } from '@/types';

import api from './api';
import utils from './utils';

export const route: Route = {
    path: '/home_latest/:routeParams?',
    categories: ['social-media'],
    example: '/twitter/home_latest',
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
                name: 'TWITTER_AUTH_TOKEN',
                description: 'Please see above for details.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Home latest timeline',
    maintainers: ['DIYgod', 'CaoMeiYouRen'],
    handler,
    radar: [
        {
            source: ['x.com/home'],
            target: '/home_latest',
        },
    ],
};

async function handler(ctx) {
    // For compatibility
    const { count, include_rts, only_media } = utils.parseRouteParams(ctx.req.param('routeParams'));
    const params = count ? { count } : {};

    await api.init();
    let data = await api.getHomeLatestTimeline('', params);
    if (!include_rts) {
        data = utils.excludeRetweet(data);
    }
    if (only_media) {
        data = utils.keepOnlyMedia(data);
    }

    return {
        title: `Twitter following timeline`,
        link: `https://x.com/home`,
        // description: userInfo?.description,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    };
}

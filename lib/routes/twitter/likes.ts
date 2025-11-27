import type { Route } from '@/types';

import api from './api';
import utils from './utils';

export const route: Route = {
    path: '/likes/:id/:routeParams?',
    categories: ['social-media'],
    example: '/twitter/likes/DIYgod',
    parameters: { id: 'username', routeParams: 'extra parameters, see the table above' },
    features: {
        requireConfig: [
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
    name: 'User likes',
    maintainers: ['xyqfer'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const { count, include_rts, only_media } = utils.parseRouteParams(ctx.req.param('routeParams'));
    const params = count ? { count } : {};

    await api.init();
    let data = await api.getUserLikes(id, params);
    if (!include_rts) {
        data = utils.excludeRetweet(data);
    }
    if (only_media) {
        data = utils.keepOnlyMedia(data);
    }

    return {
        title: `Twitter Likes - ${id}`,
        link: `https://x.com/${id}/likes`,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    };
}

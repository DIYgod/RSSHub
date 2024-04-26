import { Route } from '@/types';
import utils from './utils';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import api from './api';

export const route: Route = {
    path: '/likes/:id/:routeParams?',
    categories: ['social-media'],
    example: '/twitter/likes/DIYgod',
    parameters: { id: 'username', routeParams: 'extra parameters, see the table above' },
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
    name: 'User likes',
    maintainers: ['xyqfer'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const client = await utils.getAppClient();
    const { count, include_rts } = utils.parseRouteParams(ctx.req.param('routeParams'));
    const params = count ? { count } : {};

    await api.init();
    const userInfo = await api.getUser(id);
    let data = await api.getUserLikes(id, params);
    if (!include_rts) {
        data = utils.excludeRetweet(data);
    }

    return {
        title: `Twitter Likes - ${id}`,
        link: `https://twitter.com/${id}/likes`,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    };
}

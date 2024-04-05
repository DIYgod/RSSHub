import { Route } from '@/types';
import utils from './utils';
import api from './api';

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
    const id = ctx.req.param('id');

    // For compatibility
    const { count, exclude_replies, include_rts } = utils.parseRouteParams(ctx.req.param('routeParams'));
    const params = count ? { count } : {};

    await api.init();
    const userInfo = await api.getUser(id);
    let data = await (exclude_replies ? api.getUserTweets(id, params) : api.getUserTweetsAndReplies(id, params));
    if (!include_rts) {
        data = utils.excludeRetweet(data);
    }

    const profileImageUrl = userInfo?.profile_image_url || userInfo?.profile_image_url_https;

    return {
        title: `Twitter @${userInfo?.name}`,
        link: `https://twitter.com/${userInfo?.screen_name}`,
        image: profileImageUrl.replace(/_normal.jpg$/, '.jpg'),
        description: userInfo?.description,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    };
}

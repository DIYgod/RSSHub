import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import { queryToBoolean } from '@/utils/readable-social';

import api, { credentialsApi, hasCredentials } from './api';
import utils from './utils';

export const route: Route = {
    path: '/user/:id/:routeParams?',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/twitter/user/_RSSHub',
    parameters: {
        id: 'username; in particular, if starts with `+`, it will be recognized as a [unique ID](https://github.com/DIYgod/RSSHub/issues/12221), e.g. `+44196397`',
        routeParams: 'extra parameters, see the table above',
    },
    features: {
        requireConfig: [
            // {
            //     name: 'TWITTER_USERNAME',
            //     description: 'Please see above for details.',
            // },
            // {
            //     name: 'TWITTER_PASSWORD',
            //     description: 'Please see above for details.',
            // },
            // {
            //     name: 'TWITTER_AUTHENTICATION_SECRET',
            //     description: 'TOTP 2FA secret, please see above for details.',
            //     optional: true,
            // },
            {
                name: 'TWITTER_AUTH_TOKEN',
                description: 'Please see above for details.',
                optional: true,
            },
            {
                name: 'TWITTER_THIRD_PARTY_API',
                description: 'Use third-party API to query twitter data',
                optional: true,
            },
            {
                name: 'TWITTER_CONSUMER_KEY',
                description: 'Please see above for details.',
                optional: true,
            },
            {
                name: 'TWITTER_CONSUMER_SECRET',
                description: 'Please see above for details.',
                optional: true,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User timeline',
    maintainers: ['DIYgod', 'yindaheng98', 'Rongronggg9', 'CaoMeiYouRen', 'pseudoyu'],
    handler,
    radar: [
        {
            source: ['x.com/:id'],
            target: '/user/:id',
        },
    ],
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const routeParams = ctx.req.param('routeParams');

    // For compatibility
    const { count, include_replies, include_rts } = utils.parseRouteParams(routeParams);
    const params = count ? { count } : {};
    // The pages x.com shows logged-out visitors only have the latest original posts. Replies, a count, and reposts
    // asked for explicitly (by default they are only included when the configured API serves the feed) need credentials
    const needsCredentials = include_replies || Boolean(count) || queryToBoolean(new URLSearchParams(routeParams).get('includeRts')) === true;
    if (needsCredentials && !hasCredentials) {
        throw new ConfigNotFoundError('includeReplies, includeRts and count need Twitter credentials, such as TWITTER_AUTH_TOKEN. Remove them to read the posts that x.com shows logged-out visitors.');
    }
    const source = needsCredentials ? credentialsApi : api;

    await source.init();
    const userInfo = await source.getUser(id);
    let data = await (include_replies ? source.getUserTweetsAndReplies(id, params) : source.getUserTweets(id, params));
    const sourceCount = data.length;
    if (!include_rts) {
        data = utils.excludeRetweet(data);
    }

    const profileImageUrl = userInfo?.profile_image_url || userInfo?.profile_image_url_https;

    return {
        title: `Twitter @${userInfo?.name}`,
        link: `https://x.com/${userInfo?.screen_name}`,
        image: profileImageUrl?.replace(/_normal.jpg$/, '.jpg'),
        description: userInfo?.description,
        item:
            data &&
            utils.ProcessFeed(ctx, {
                data,
            }),
        allowEmpty: !include_rts && sourceCount > 0 && data.length === 0,
    };
}

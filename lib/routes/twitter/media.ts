import { Route, ViewType } from '@/types';
import api from './api';
import utils from './utils';
import logger from '@/utils/logger';

export const route: Route = {
    path: '/media/:id/:routeParams?',
    categories: ['social-media', 'popular'],
    view: ViewType.Pictures,
    example: '/twitter/media/_RSSHub',
    parameters: { id: 'username; in particular, if starts with `+`, it will be recognized as a [unique ID](https://github.com/DIYgod/RSSHub/issues/12221), e.g. `+44196397`', routeParams: 'extra parameters, see the table above.' },
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
    name: 'User media',
    maintainers: ['DIYgod', 'yindaheng98', 'Rongronggg9'],
    handler,
    radar: [
        {
            source: ['x.com/:id/media'],
            target: '/media/:id',
        },
    ],
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const { count } = utils.parseRouteParams(ctx.req.param('routeParams'));
    const params = count ? { count } : {};

    await api.init();
    const userInfo = await api.getUser(id);
    let data;
    try {
        data = await api.getUserMedia(id, params);
    } catch (error) {
        logger.error(error);
    }
    const profileImageUrl = userInfo?.profile_image_url || userInfo?.profile_image_url_https;

    return {
        title: `Twitter @${userInfo?.name}`,
        link: `https://x.com/${userInfo?.screen_name}/media`,
        image: profileImageUrl.replace(/_normal.jpg$/, '.jpg'),
        description: userInfo?.description,
        item:
            data &&
            utils.ProcessFeed(ctx, {
                data,
            }),
        allowEmpty: true,
    };
}

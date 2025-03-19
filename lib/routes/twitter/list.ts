import { Route } from '@/types';
import api from './api';
import utils from './utils';

export const route: Route = {
    path: '/list/:id/:routeParams?',
    categories: ['social-media', 'popular'],
    example: '/twitter/list/1502570462752219136',
    parameters: { id: 'list id, get from url', routeParams: 'extra parameters, see the table above' },
    features: {
        requireConfig: [
            {
                name: 'TWITTER_AUTH_TOKEN',
                description: 'Please see above for details.',
            },
            {
                name: 'TWITTER_THIRD_PARTY_API',
                description: 'Please see above for details.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'List timeline',
    maintainers: ['DIYgod', 'xyqfer', 'pseudoyu'],
    handler,
    radar: [
        {
            source: ['x.com/i/lists/:id'],
            target: '/list/:id',
        },
    ],
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const { count, include_rts, only_media } = utils.parseRouteParams(ctx.req.param('routeParams'));
    const params = count ? { count } : {};

    await api.init();
    let data = await api.getList(id, params);
    if (!include_rts) {
        data = utils.excludeRetweet(data);
    }
    if (only_media) {
        data = utils.keepOnlyMedia(data);
    }

    return {
        title: `Twitter List - ${id}`,
        link: `https://x.com/i/lists/${id}`,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    };
}

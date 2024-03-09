import { Route } from '@/types';
import utils from './utils';
import { config } from '@/config';
const T = {};
import { TwitterApi } from 'twitter-api-v2';
import { fallback, queryToBoolean } from '@/utils/readable-social';

export const route: Route = {
    path: '/collection/:uid/:collectionId/:routeParams?',
    categories: ['social-media'],
    example: '/twitter/collection/DIYgod/1527857429467172864',
    parameters: { uid: 'username, should match the generated token', collectionId: 'collection ID, can be found in URL', routeParams: 'extra parameters, see the table above' },
    features: {
        requireConfig: true,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Collection',
    maintainers: ['TonyRL'],
    handler,
    description: `:::warning
  This route requires Twitter token's corresponding id, therefore it's only available when self-hosting, refer to the [Deploy Guide](/install/#route-specific-configurations) for route-specific configurations.
  :::`,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const collectionId = ctx.req.param('collectionId');
    const cookie = config.twitter.tokens[uid];
    if (!cookie) {
        throw new Error(`lacking twitter token for user ${uid}`);
    } else if (!T[uid]) {
        const token = cookie.split(',');
        T[uid] = new TwitterApi({
            appKey: token[0],
            appSecret: token[1],
            accessToken: token[2],
            accessSecret: token[3],
        }).readOnly;
    }

    const id = `custom-${collectionId}`;

    const data = await T[uid].v1.get('collections/entries.json', {
        id,
        count: ctx.req.query('limit') ? (Number(ctx.req.query('limit')) > 200 ? 200 : Number(ctx.req.query('limit'))) : 200,
    });

    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));

    // fix user without screen_name
    for (const tweet of Object.values(data.objects.tweets)) {
        tweet.user = data.objects.users[tweet.user.id_str];
        if (tweet.quoted_status) {
            tweet.quoted_status.user = data.objects.users[tweet.quoted_status.user.id_str];
        }
    }

    return {
        title: data.objects.timelines[id].name,
        description: data.objects.timelines[id].description,
        link: data.objects.timelines[id].collection_url,
        item: utils.ProcessFeed(
            ctx,
            {
                data: Object.values(data.objects.tweets),
            },
            {
                showAuthorInTitle: fallback(undefined, queryToBoolean(routeParams.get('showAuthorInTitle')), true),
                showAuthorInDesc: fallback(undefined, queryToBoolean(routeParams.get('showAuthorInDesc')), true),
            }
        ),
    };
}

const utils = require('./utils');
const config = require('@/config').value;
const T = {};
const { TwitterApi } = require('twitter-api-v2');
const { fallback, queryToBoolean } = require('@/utils/readable-social');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const collectionId = ctx.params.collectionId;
    const cookie = config.twitter.tokens[uid];
    if (!cookie) {
        throw Error(`lacking twitter token for user ${uid}`);
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
        count: ctx.query.limit ? (Number(ctx.query.limit) > 200 ? 200 : Number(ctx.query.limit)) : 200,
    });

    const routeParams = new URLSearchParams(ctx.params.routeParams);

    // fix user without screen_name
    Object.values(data.objects.tweets).forEach((tweet) => {
        tweet.user = data.objects.users[tweet.user.id_str];
        if (tweet.quoted_status) {
            tweet.quoted_status.user = data.objects.users[tweet.quoted_status.user.id_str];
        }
    });

    ctx.state.data = {
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
};

// @ts-nocheck
// import { config } from '@/config';
const { getUser, getUserTweet } = require('./twitter-api');
const utils = require('../utils');
import { fallback, queryToBoolean } from '@/utils/readable-social';
import { config } from '@/config';
const { initToken } = require('./token');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const status = ctx.req.param('status');
    const routeParams = new URLSearchParams(ctx.req.param('original'));
    const original = fallback(undefined, queryToBoolean(routeParams.get('original')), false);
    const params = { focalTweetId: status };
    await initToken();
    const userInfo = await getUser(id);
    const data = await getUserTweet(id, params);
    const profileImageUrl = userInfo.profile_image_url || userInfo.profile_image_url_https;
    const item = original && config.isPackage ? data : utils.ProcessFeed(ctx, { data });

    ctx.set('data', {
        title: `Twitter @${userInfo.name}`,
        link: `https://twitter.com/${userInfo.screen_name}/status/${status}`,
        image: profileImageUrl.replace(/_normal.jpg$/, '.jpg'),
        description: userInfo.description,
        item,
    });
};

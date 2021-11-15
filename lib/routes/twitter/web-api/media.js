const utils = require('../utils');
// import { config } from '~/config.js';
const { getUser, getUserMedia } = require('./twitter-api');

export default async (ctx) => {
    const id = ctx.params.id;
    const userInfo = await getUser(ctx.cache, id);
    const data = await getUserMedia(ctx.cache, id);
    const profileImageUrl = userInfo.profile_image_url || userInfo.profile_image_url_https;

    ctx.state.data = {
        title: `Twitter @${userInfo.name}`,
        link: `https://twitter.com/${id}/media`,
        image: profileImageUrl,
        description: userInfo.description,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    };
};

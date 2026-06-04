import utils from '../../utils';
import api from './api';

const handler = async (ctx) => {
    const id = ctx.req.param('id');
    // For compatibility
    const { include_replies, include_rts, count } = utils.parseRouteParams(ctx.req.param('routeParams'));
    const params = count ? { count } : {};

    await api.init();
    const userInfo: any = await api.getUser(id);
    let data = await (include_replies ? api.getUserTweetsAndReplies(id, params) : api.getUserTweets(id, params));
    if (!include_rts) {
        data = utils.excludeRetweet(data);
    }

    const screenName = userInfo?.screen_name;
    const profileImageUrl = userInfo?.profile_image_url || userInfo?.profile_image_url_https;

    return {
        title: `Twitter @${userInfo.name}`,
        link: `https://x.com/${screenName}`,
        image: profileImageUrl,
        description: userInfo.description,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
        allowEmpty: true,
    };
};
export default handler;

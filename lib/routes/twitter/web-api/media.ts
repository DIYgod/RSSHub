import utils from '../utils';
// import { config } from '@/config';
import { getUser, getUserMedia } from './twitter-api';
import { initToken } from './token';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const { count } = utils.parseRouteParams(ctx.req.param('routeParams'));
    const params = count ? { count } : {};

    await initToken();
    const userInfo = await getUser(id);
    const data = await getUserMedia(id, params);
    const profileImageUrl = userInfo.profile_image_url || userInfo.profile_image_url_https;

    return {
        title: `Twitter @${userInfo.name}`,
        link: `https://twitter.com/${userInfo.screen_name}/media`,
        image: profileImageUrl.replace(/_normal.jpg$/, '.jpg'),
        description: userInfo.description,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    };
};

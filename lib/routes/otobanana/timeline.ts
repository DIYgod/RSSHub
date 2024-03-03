// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { apiBase, baseUrl, getUserInfo, renderPost } = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');

    const userInfo = await getUserInfo(id, cache.tryGet);
    const { data: postData } = await got(`${apiBase}/users/${id}/posts/`);

    const posts = postData.results.map((item) => renderPost(item));

    ctx.set('data', {
        title: `${userInfo.name} (@${userInfo.username}) - タイムライン | OTOBANANA`,
        description: userInfo.bio.replaceAll('\n', ' '),
        link: `${baseUrl}/user/${id}`,
        image: userInfo.avatar_url,
        icon: userInfo.avatar_url,
        logo: userInfo.avatar_url,
        language: 'ja',
        author: userInfo.name,
        itunes_author: userInfo.name,
        item: posts,
    });

    ctx.set('json', {
        userInfo,
        postData,
    });
};

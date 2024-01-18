const got = require('@/utils/got');
const { apiBase, baseUrl, getUserInfo, renderPost } = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const userInfo = await getUserInfo(id, ctx.cache.tryGet);
    const { data: postData } = await got(`${apiBase}/users/${id}/posts/`);

    const posts = postData.results.map((item) => renderPost(item));

    ctx.state.data = {
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
    };

    ctx.state.json = {
        userInfo,
        postData,
    };
};

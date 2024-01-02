const got = require('@/utils/got');
const { apiBase, baseUrl, getUserInfo, renderCast } = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const userInfo = await getUserInfo(id, ctx.cache.tryGet);
    const { data: castData } = await got(`${apiBase}/users/${id}/casts/`);

    const casts = castData.results.map((item) => renderCast(item));

    ctx.state.data = {
        title: `${userInfo.name} (@${userInfo.username}) - 音声投稿 | OTOBANANA`,
        description: userInfo.bio.replace(/\n/g, ' '),
        link: `${baseUrl}/user/${id}`,
        image: userInfo.avatar_url,
        icon: userInfo.avatar_url,
        logo: userInfo.avatar_url,
        language: 'ja',
        author: userInfo.name,
        itunes_author: userInfo.name,
        item: casts,
    };

    ctx.state.json = {
        userInfo,
        castData,
    };
};

const got = require('@/utils/got');
const { apiBase, baseUrl, getUserInfo, renderLive } = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const userInfo = await getUserInfo(id, ctx.cache.tryGet);
    const { data: liveData } = await got(`${apiBase}/users/${id}/livestreams/`);

    const casts = liveData.results.map((item) => renderLive(item));

    ctx.state.data = {
        title: `${userInfo.name} (@${userInfo.username}) - ライブ配信 | OTOBANANA`,
        description: userInfo.bio.replaceAll('\n', ' '),
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
        liveData,
    };
};

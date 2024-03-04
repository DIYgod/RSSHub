// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { apiBase, baseUrl, getUserInfo, renderLive } = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');

    const userInfo = await getUserInfo(id, cache.tryGet);
    const { data: liveData } = await got(`${apiBase}/users/${id}/livestreams/`);

    const casts = liveData.results.map((item) => renderLive(item));

    ctx.set('data', {
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
    });

    ctx.set('json', {
        userInfo,
        liveData,
    });
};

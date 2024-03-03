// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { apiBase, baseUrl, getUserInfo, renderCast } = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');

    const userInfo = await getUserInfo(id, cache.tryGet);
    const { data: castData } = await got(`${apiBase}/users/${id}/casts/`);

    const casts = castData.results.map((item) => renderCast(item));

    ctx.set('data', {
        title: `${userInfo.name} (@${userInfo.username}) - 音声投稿 | OTOBANANA`,
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
        castData,
    });
};

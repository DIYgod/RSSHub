// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const uid = ctx.req.param('uid');

    const response = await got.post('https://music.163.com/api/user/playlist', {
        headers: {
            Referer: 'https://music.163.com/',
        },
        form: {
            uid,
            limit: 1000,
            offset: 0,
        },
    });

    const playlist = response.data.playlist || [];

    const creator = (playlist[0] || {}).creator;

    const { nickname, signature, avatarUrl } = creator;

    ctx.set('data', {
        title: `${nickname} 的所有歌单`,
        link: `https://music.163.com/user/home?id=${uid}`,
        subtitle: signature,
        description: signature,
        author: nickname,
        updated: response.headers.date,
        icon: avatarUrl,
        image: avatarUrl,
        item: playlist.map((pl) => {
            const src = `http://music.163.com/playlist/${pl.id}`;

            const html = art(path.join(__dirname, '../templates/music/userplaylist.art'), {
                image: pl.coverImgUrl,
                description: (pl.description || '').split('\n'),
                src,
            });

            return {
                title: pl.name,
                link: src,
                pubDate: new Date(pl.createTime).toUTCString(),
                published: new Date(pl.createTime).toISOString(),
                updated: new Date(pl.updateTime).toISOString(),
                author: pl.creator.nickname,
                description: html,
                content: { html },
                category: pl.tags,
            };
        }),
    });
};

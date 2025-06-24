import { Route } from '@/types';

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/music/user/playlist/:uid',
    categories: ['multimedia'],
    example: '/163/music/user/playlist/45441555',
    parameters: { uid: '用户 uid, 可在用户主页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户歌单',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
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

    return {
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
    };
}

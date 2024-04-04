import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { config } from '@/config';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/music/playlist/:id',
    categories: ['multimedia'],
    example: '/163/music/playlist/35798529',
    parameters: { id: '歌单 id, 可在歌单页 URL 中找到' },
    features: {
        requireConfig: [
            {
                name: 'NCM_COOKIES',
                optional: true,
                description: '网易云音乐登陆后的 cookie 值，可在浏览器控制台通过`document.cookie`获取。',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '歌单歌曲',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const response = await got.get(`https://music.163.com/api/v3/playlist/detail?id=${id}`, {
        headers: {
            Referer: 'https://music.163.com/',
            Cookie: config.ncm.cookies,
        },
    });

    const data = response.data.playlist;
    const songinfo = await got('https://music.163.com/api/song/detail', {
        headers: {
            Referer: 'https://music.163.com',
        },
        searchParams: {
            ids: `[${data.trackIds.slice(0, 201).map((item) => item.id)}]`,
        },
    });
    const songs = songinfo.data.songs;

    return {
        title: data.name,
        link: `https://music.163.com/#/playlist?id=${id}`,
        description: `网易云音乐歌单 - ${data.name}`,
        item: data.trackIds.slice(0, 201).map((item) => {
            const thisSong = songs.find((element) => element.id === item.id);
            const singer = thisSong.artists.length === 1 ? thisSong.artists[0].name : thisSong.artists.reduce((prev, cur) => (prev.name || prev) + '/' + cur.name);
            return {
                title: `${thisSong.name} - ${singer}`,
                description: art(path.join(__dirname, '../templates/music/playlist.art'), {
                    singer,
                    album: thisSong.album.name,
                    date: new Date(thisSong.album.publishTime).toLocaleDateString(),
                    picUrl: thisSong.album.picUrl,
                }),
                link: `https://music.163.com/#/song?id=${item.id}`,
                pubDate: new Date(item.at),
                author: singer,
            };
        }),
    };
}

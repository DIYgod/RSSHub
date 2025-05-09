import { Route } from '@/types';

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/music/artist/songs/:id',
    categories: ['multimedia'],
    example: '/163/music/artist/songs/2116',
    parameters: { id: '歌手 id, 可在歌手详情页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '歌手歌曲',
    maintainers: ['ZhongMingKun'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const { data } = await got(`https://music.163.com/api/v1/artist/songs`, {
        headers: {
            Referer: 'https://music.163.com/',
        },
        searchParams: {
            id,
            private_cloud: 'true',
            work_type: 1,
            order: 'time',
            offset: 0,
            limit: 100,
        },
    });

    const artist = data.songs.find(({ ar }) => ar[0].id === Number.parseInt(id)).ar[0];
    const items = data.songs.map((song) => ({
        title: `${song.name} - ${song.ar.map(({ name }) => name).join(' / ')}`,
        description: art(path.join(__dirname, '../templates/music/playlist.art'), {
            singer: song.ar.map(({ name }) => name).join(' / '),
            album: song.al.name,
            picUrl: song.al.picUrl,
        }),
        link: `https://music.163.com/#/song?id=${song.id}`,
    }));

    return {
        title: `${artist.name} - 歌手歌曲`,
        link: `https://music.163.com/#/artist?id=${id}`,
        description: `网易云音乐 - 歌手歌曲 - ${artist.name}`,
        item: items,
    };
}

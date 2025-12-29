import type { Route } from '@/types';
import got from '@/utils/got';

import { renderPlaylistDescription } from '../templates/music/playlist';

export const route: Route = {
    path: '/music/artist/:id',
    categories: ['multimedia'],
    example: '/163/music/artist/2116',
    parameters: { id: '歌手 id, 可在歌手详情页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '歌手专辑',
    maintainers: ['metowolf'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const response = await got(`https://music.163.com/api/artist/albums/${id}`, {
        headers: {
            Referer: 'https://music.163.com/',
        },
    });

    const data = response.data;

    return {
        title: data.artist.name,
        link: `https://music.163.com/#/artist/album?id=${id}`,
        description: `网易云音乐歌手专辑 - ${data.artist.name}`,
        image: data.artist.img1v1Url || data.artist.picUrl,
        item: data.hotAlbums.map((item) => {
            const singer = item.artists.length === 1 ? item.artists[0].name : item.artists.reduce((prev, cur) => (prev.name || prev) + '/' + cur.name);
            return {
                title: `${item.name} - ${singer}`,
                description: renderPlaylistDescription({
                    singer,
                    album: item.name,
                    date: new Date(item.publishTime).toLocaleDateString(),
                    picUrl: item.picUrl,
                }),
                link: `https://music.163.com/#/album?id=${item.id}`,
                pubDate: new Date(item.publishTime),
                published: new Date(item.publishTime),
                category: item.subType,
                author: singer,
            };
        }),
    };
}

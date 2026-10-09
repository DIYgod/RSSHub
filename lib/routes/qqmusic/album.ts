import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/album/:mid',
    example: '/qqmusic/album/001N8TFz49WZol',
    name: '专辑节目更新',
    categories: ['multimedia'],
    maintainers: ['DIYgod'],
    parameters: { mid: 'Album ID from the website URL.' },
    description: 'Lists episodes in the source’s newest-first order. Includes public metadata and episode links; playback follows QQ Music’s access requirements.',
    radar: [{ source: ['y.qq.com/n/ryqq/albumDetail/:mid'], target: '/album/:mid' }],
    handler,
};

async function handler(ctx) {
    const mid = ctx.req.param('mid');
    const response = await ofetch('https://u.y.qq.com/cgi-bin/musicu.fcg', {
        responseType: 'json',
        query: {
            data: JSON.stringify({
                album: { module: 'music.musichallAlbum.AlbumInfoServer', method: 'GetAlbumDetail', param: { albumMid: mid } },
                tracks: { module: 'music.musichallAlbum.AlbumSongList', method: 'GetAlbumSongList', param: { albumMid: mid, begin: 0, num: 20, order: 2 } },
            }),
        },
    });
    if (response.album.code !== 0 || response.tracks.code !== 0) {
        throw new Error('QQ Music did not return this album. Check the album ID and public availability.');
    }
    const album = response.album.data.basicInfo;
    const cover = `https://y.gtimg.cn/music/photo_new/T002R800x800M000${mid}.jpg`;
    return {
        title: `${album.albumName} - QQ 音乐`,
        link: `https://y.qq.com/n/ryqq/albumDetail/${mid}`,
        description: album.desc,
        image: cover,
        language: 'zh-CN' as const,
        item: response.tracks.data.songList.map((episode) => ({
            title: episode.songInfo.title,
            link: `https://y.qq.com/n/ryqq/songDetail/${episode.songInfo.mid}`,
            author: episode.songInfo.singer.map((singer) => singer.name).join(', '),
            pubDate: episode.uploadTime ? parseDate(episode.uploadTime, 'YYYY-MM-DD') : undefined,
            description: `<img src="${cover}">`,
            itunes_duration: episode.songInfo.interval,
        })),
    };
}

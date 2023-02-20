const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { id } = ctx.params;

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

    const artist = data.songs.find(({ ar }) => ar[0].id === parseInt(id)).ar[0];
    const items = data.songs.map((song) => ({
        title: `${song.name} - ${song.ar.map(({ name }) => name).join(' / ')}`,
        description: art(path.join(__dirname, '../templates/music/playlist.art'), {
            singer: song.ar.map(({ name }) => name).join(' / '),
            album: song.al.name,
            picUrl: song.al.picUrl,
        }),
        link: `https://music.163.com/#/song?id=${song.id}`,
    }));

    ctx.state.data = {
        title: `${artist.name} - 歌手歌曲`,
        link: `https://music.163.com/#/artist?id=${id}`,
        description: `网易云音乐 - 歌手歌曲 - ${artist.name}`,
        item: items,
    };
};

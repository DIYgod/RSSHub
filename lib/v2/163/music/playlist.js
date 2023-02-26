const got = require('@/utils/got');
const config = require('@/config').value;
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    if (!config.ncm || !config.ncm.cookies) {
        throw '163 Music RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }

    const id = ctx.params.id;

    const response = await got.post('https://music.163.com/api/v3/playlist/detail', {
        headers: {
            Referer: 'https://music.163.com/',
            Cookie: config.ncm.cookies,
        },
        form: {
            id,
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

    ctx.state.data = {
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
};

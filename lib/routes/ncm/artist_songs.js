const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const limit = ctx.params.limit || 10;

    const response = await got({
        method: 'get',
        url: `https://music.163.com/api/v1/artist/songs?id=${id}&offset=0&private_cloud=true&order=time&work_type=1&limit=${limit}`,
        headers: {
            Referer: 'https://music.163.com/',
            authority: 'https://music.163.com/',
            crypto: 'weapi',
            cookie: { os: 'pc' },
        },
    });

    const data = response.data;
    const artists = data.songs.length ? data.songs[0].ar : [];
    const artist = artists[0] || {};

    ctx.state.data = {
        title: `${artist.name} - 所有歌曲`,
        link: `https://music.163.com/#/artist?id=${id}`,
        description: `网易云音乐歌手歌单 - ${artist.name}`,
        item: data.songs.map((item) => {
            const singer = item.ar.length === 1 ? item.ar[0].name : item.ar.reduce((prev, cur) => (prev.name || prev) + '/' + cur.name);
            return {
                title: `${item.name} - ${singer}`,
                description: `
                ${singer}<br>
                ${item.name}<br>
                ${item.al.name}<br>
                <img src="${item.al.picUrl}"><br>
                <a href="https://music.163.com/#/song?id=${item.id}">去听歌</a>`,
                picUrl: item.al.picUrl,
                link: `https://music.163.com/#/song?id=${item.id}`,
                author: singer,
            };
        }),
    };
};

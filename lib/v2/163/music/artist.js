const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got(`https://music.163.com/api/artist/albums/${id}`, {
        headers: {
            Referer: 'https://music.163.com/',
        },
    });

    const data = response.data;

    ctx.state.data = {
        title: data.artist.name,
        link: `https://music.163.com/#/artist/album?id=${id}`,
        description: `网易云音乐歌手专辑 - ${data.artist.name}`,
        image: data.artist.img1v1Url || data.artist.picUrl,
        item: data.hotAlbums.map((item) => {
            const singer = item.artists.length === 1 ? item.artists[0].name : item.artists.reduce((prev, cur) => (prev.name || prev) + '/' + cur.name);
            return {
                title: `${item.name} - ${singer}`,
                description: art(path.join(__dirname, '../templates/music/playlist.art'), {
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
};

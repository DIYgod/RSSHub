const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'post',
        url: 'https://music.163.com/api/v3/playlist/detail',
        headers: {
            Referer: 'https://music.163.com/',
        },
        form: {
            id: id,
        },
    });

    const data = response.data.playlist;
    const songinfo = await got({
        method: 'get',
        url: `https://music.163.com/api/song/detail?ids=[${data.trackIds.slice(0, 201).map((item) => item.id)}]`,
        headers: {
            Referer: 'https://music.163.com',
        },
    });
    const songs = songinfo.data.songs;

    ctx.state.data = {
        title: data.name,
        link: `https://music.163.com/#/playlist?id=${id}`,
        description: `网易云音乐歌单 - ${data.name}`,
        item: data.trackIds.slice(0, 201).map((item) => {
            const thissong = songs.find((element) => element.id === item.id);
            const singer = thissong.artists.length === 1 ? thissong.artists[0].name : thissong.artists.reduce((prev, cur) => (prev.name || prev) + '/' + cur.name);
            return {
                title: `${thissong.name} - ${singer}`,
                description: `歌手：${singer}<br>专辑：${thissong.album.name}<br>发行日期：${new Date(thissong.album.publishTime).toLocaleDateString()}<br><img src="${thissong.album.picUrl}">`,
                link: `https://music.163.com/#/song?id=${item.id}`,
                pubDate: new Date(item.at),
                author: singer,
            };
        }),
    };
};

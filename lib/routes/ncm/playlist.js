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

    ctx.state.data = {
        title: data.name,
        link: `https://music.163.com/#/playlist?id=${id}`,
        description: `网易云音乐歌单 - ${data.name}`,
        item:
            data.tracks &&
            data.tracks.map((item) => {
                const singer = item.ar.length === 1 ? item.ar[0].name : item.ar.reduce((prev, cur) => (prev.name || prev) + '/' + cur.name);
                return {
                    title: `${item.name} - ${singer}`,
                    description: `歌手：${singer}<br>专辑：${item.al.name}<br>日期：${new Date(item.publishTime).toLocaleDateString()}<br><img src="${item.al.picUrl}">`,
                    link: `https://music.163.com/#/song?id=${item.id}`,
                };
            }),
    };
};

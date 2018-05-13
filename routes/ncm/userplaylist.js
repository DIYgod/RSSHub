const axios = require('axios');
const qs = require('querystring');
const config = require('../../config');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const response = await axios({
        method: 'post',
        url: 'http://music.163.com/api/user/playlist',
        headers: {
            'User-Agent': config.ua,
            'Referer': 'https://music.163.com/',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
            uid: uid,
            limit: 1000,
            offset: 0
        }),
    });

    const playlist = response.data.playlist || [{ creator: {} }];

    const creator = playlist[0].creator;

    const { nickname, signature } = creator;

    ctx.state.data = {
        title: `${nickname} 的所有歌单`,
        link: `http://music.163.com/user/home?id=${uid}`,
        description: signature,
        item: playlist.map((pl) => ({
            title: pl.name,
            description: pl.description,
            pubDate: new Date(pl.createTime).toUTCString(),
            link: `http://music.163.com/playlist?id=${pl.id}`
        }))
    };
};
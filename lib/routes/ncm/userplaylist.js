const got = require('@/utils/got');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const response = await got({
        method: 'post',
        url: 'http://music.163.com/api/user/playlist',
        headers: {
            Referer: 'https://music.163.com/',
        },
        form: {
            uid: uid,
            limit: 1000,
            offset: 0,
        },
    });

    const playlist = response.data.playlist || [];

    const creator = (playlist[0] || {}).creator;

    const { nickname, signature, avatarUrl } = creator;

    ctx.state.data = {
        title: `${nickname} 的所有歌单`,
        link: `http://music.163.com/user/home?id=${uid}`,
        subtitle: signature,
        description: signature,
        author: nickname,
        updated: response.headers.date,
        icon: avatarUrl,
        item: playlist.map((pl) => {
            const image = `<img src=${pl.coverImgUrl} />`;

            const description = `<div>${(pl.description || '')
                .split('\n')
                .map((p) => `<p>${p}</p>`)
                .join('')}</div>`;

            const src = `http://music.163.com/playlist/${pl.id}`;

            const html = image + description + `<div><a href="${src}">查看歌单</a></div>`;

            return {
                title: pl.name,
                link: src,
                pubDate: new Date(pl.createTime).toUTCString(),
                published: new Date(pl.createTime).toISOString(),
                updated: new Date(pl.updateTime).toISOString(),
                author: pl.creator.nickname,
                description: html,
                content: { html },
                category: pl.tags,
            };
        }),
    };
};

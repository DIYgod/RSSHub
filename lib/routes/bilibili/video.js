const got = require('@/utils/got');
const cache = require('./cache');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const name = await cache.getUsernameFromUID(ctx, uid);

    const response = await got({
        method: 'get',
        url: `https://space.bilibili.com/ajax/member/getSubmitVideos?mid=${uid}`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });
    const data = response.data;

    ctx.state.data = {
        title: `${name} 的 bilibili 空间`,
        link: `https://space.bilibili.com/${uid}`,
        description: `${name} 的 bilibili 空间`,
        item:
            data.data &&
            data.data.vlist &&
            data.data.vlist.map((item) => ({
                title: item.title,
                description:
                    `${item.description}<br><img src="https:${item.pic}">` +
                    `<br><iframe src="https://player.bilibili.com/player.html?aid=${item.aid}" width="640" height="360" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`,
                pubDate: new Date(item.created * 1000).toUTCString(),
                link: `https://www.bilibili.com/video/av${item.aid}`,
                author: name,
            })),
    };
};

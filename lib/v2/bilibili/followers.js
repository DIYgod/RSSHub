const got = require('@/utils/got');
const cache = require('./cache');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const name = await cache.getUsernameFromUID(ctx, uid);

    const countResponse = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/relation/stat?vmid=${uid}`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });
    const count = countResponse.data.data.follower;

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/relation/followers?vmid=${uid}`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });
    const data = response.data.data.list;

    ctx.state.data = {
        title: `${name} 的 bilibili 粉丝`,
        link: `https://space.bilibili.com/${uid}/#/fans/fans`,
        description: `${name} 的 bilibili 粉丝`,
        item: data.map((item) => ({
            title: `${name} 新粉丝 ${item.uname}`,
            description: `${item.uname}<br>${item.sign}<br>总计${count}`,
            pubDate: new Date(item.mtime * 1000).toUTCString(),
            link: `https://space.bilibili.com/${item.mid}`,
        })),
    };
};

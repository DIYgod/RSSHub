const got = require('@/utils/got');
const cache = require('./cache');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const login_uid = ctx.params.login_uid;

    const name = await cache.getUsernameFromUID(ctx, uid);

    const cookie = config.bilibili.cookies[login_uid];
    if (cookie === undefined) {
        throw Error('缺少对应 login_uid 的 Bilibili 用户登录后的 Cookie 值');
    }

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
            Cookie: cookie,
        },
    });
    if (response.data.code === -6) {
        throw Error('对应 login_uid 的 Bilibili 用户的 Cookie 已过期');
    }
    const data = response.data.data.list;

    ctx.state.data = {
        title: `${name} 的 bilibili 粉丝`,
        link: `https://space.bilibili.com/${uid}/#/fans/fans`,
        description: `${name} 的 bilibili 粉丝`,
        item: data.map((item) => ({
            title: `${name} 新粉丝 ${item.uname}`,
            description: `${item.uname}<br>${item.sign}<br>总计${count}`,
            pubDate: new Date(item.mtime * 1000),
            link: `https://space.bilibili.com/${item.mid}`,
        })),
    };
};

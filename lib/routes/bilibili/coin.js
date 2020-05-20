const got = require('@/utils/got');
const cache = require('./cache');
const utils = require('./utils');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const disableEmbed = ctx.params.disableEmbed;

    const name = await cache.getUsernameFromUID(ctx, uid);

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/space/coin/video?vmid=${uid}&jsonp=jsonp`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });
    const data = response.data.data;

    ctx.state.data = {
        title: `${name} 的 bilibili 投币视频`,
        link: `https://space.bilibili.com/${uid}`,
        description: `${name} 的 bilibili 投币视频`,
        item: data.map((item) => ({
            title: item.title,
            description: `${item.desc}${!disableEmbed ? `<br><br>${utils.iframe(item.aid)}` : ''}<br><img src="${item.pic}">`,
            pubDate: new Date(item.time * 1000).toUTCString(),
            link: item.time > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
        })),
    };
};

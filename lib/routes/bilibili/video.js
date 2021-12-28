const got = require('@/utils/got');
const cache = require('./cache');
const utils = require('./utils');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const disableEmbed = ctx.params.disableEmbed;
    const name = await cache.getUsernameFromUID(ctx, uid);

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/space/arc/search?mid=${uid}&ps=10&tid=0&pn=1&order=pubdate&jsonp=jsonp`,
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
            data.data.list &&
            data.data.list.vlist &&
            data.data.list.vlist.map((item) => ({
                title: item.title,
                description: `${item.description}${!disableEmbed ? `<br><br>${utils.iframe(item.aid)}` : ''}<br><img src="${item.pic}">`,
                pubDate: new Date(item.created * 1000).toUTCString(),
                link: item.created > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
                author: name,
            })),
    };
};

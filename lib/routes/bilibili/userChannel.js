const got = require('@/utils/got');
const cache = require('./cache');
const utils = require('./utils');

module.exports = async (ctx) => {
    const cid = ctx.params.cid;
    const uid = ctx.params.uid;
    const ctype = ctx.params.ctype || '0';
    const disableEmbed = isNaN(ctype) ? 'disableEmbed' : ctx.params.disableEmbed;

    const link = `https://space.bilibili.com/${uid}/detail?cid=${cid}&ctype=${ctype}`;
    const userName = await cache.getUsernameFromUID(ctx, uid);
    const host = `https://api.bilibili.com/x/space/channel/video?mid=${uid}&cid=${cid}&pn=1&ps=10&order=0&ctype=${ctype}`;
    const response = await got({
        method: 'get',
        url: host,
        headers: {
            Referer: link,
        },
    });

    let data = response.data;
    if (!data.data) {
        ctx.state.data = {
            title: '此 bilibili 频道不存在',
        };
        return;
    } else {
        data = data.data.list;
    }

    const channelName = data.name;

    ctx.state.data = {
        title: `${userName} 的 bilibili 频道 ${channelName}`,
        link,
        description: data.name,

        item: data.archives.map((item) => ({
            title: item.title,
            description: `${item.desc}${!disableEmbed ? `<br><br>${utils.iframe(item.aid)}` : ''}<br><img src="${item.pic}">`,
            pubDate: new Date(item.pubdate * 1000).toUTCString(),
            link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
            author: userName,
        })),
    };
};

const axios = require('../../utils/axios');
const cache = require('./cache');

module.exports = async (ctx) => {
    const cid = ctx.params.cid;
    const uid = ctx.params.uid;

    const userName = await cache.getUsernameFromUID(ctx, uid);
    const host = `https://api.bilibili.com/x/space/channel/video?mid=${uid}&cid=${cid}&pn=1&ps=10&order=0`;
    const response = await axios({
        method: 'get',
        url: host,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
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
        link: `https://space.bilibili.com/${uid}/#/channel/detail?cid=${cid}`,
        description: data.name,

        item: data.archives.map((item) => ({
            title: item.title,
            description: `${item.desc}<br><img referrerpolicy="no-referrer" src="${item.pic}">`,
            pubDate: new Date(item.pubdate * 1000).toUTCString(),
            link: `https://www.bilibili.com/video/av${item.aid}`,
        })),
    };
};

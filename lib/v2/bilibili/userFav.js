const got = require('@/utils/got');
const cache = require('./cache');
const utils = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const disableEmbed = ctx.params.disableEmbed;
    const [name] = await cache.getUsernameAndFaceFromUID(ctx, uid);

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/v2/fav/video?vmid=${uid}&ps=30&tid=0&keyword=&pn=1&order=fav_time`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/#/favlist`,
            Cookie: config.bilibili.cookies[uid],
        },
    });
    const data = response.data;

    // console.log('========data.archives========', data.archives)

    ctx.state.data = {
        title: `${name} 的 bilibili 默认收藏夹`,
        link: `https://space.bilibili.com/${uid}/#/favlist`,
        description: `${name} 的 bilibili 默认收藏夹`,

        item:
            data.data &&
            data.data.archives &&
            data.data.archives.map((item) => ({
                title: item.title,
                cover: item.pic,
                description: `${item.desc}${!disableEmbed ? `<br><br>${utils.iframe(item.aid)}` : ''}<br><img src="${item.pic}">`,
                pubDate: new Date(item.fav_at * 1000).toUTCString(),
                link: item.fav_at > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
                author: item.owner.name,
                _extra: {
                    intro: item.desc,
                    duration: item.length,
                    iframeUrl: utils.iframe(item.aid),
                },
            })),
    };
};

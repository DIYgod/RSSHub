const axios = require('@/utils/axios');
const cache = require('./cache');

module.exports = async (ctx) => {
    const fid = ctx.params.fid;
    const uid = ctx.params.uid;

    const response = await axios({
        method: 'get',
        url: `https://api.bilibili.com/x/v2/fav/video?vmid=${uid}&fid=${fid}`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });
    const data = response.data.data;
    const userName = await cache.getUsernameFromUID(ctx, uid);
    const favName = await cache.getFavNameFromFid(ctx, fid, uid);

    ctx.state.data = {
        title: `${userName} 的 bilibili 收藏夹 ${favName}`,
        link: `https://space.bilibili.com/${uid}/#/favlist?fid=${fid}`,
        description: `${userName} 的 bilibili 收藏夹 ${favName}`,

        item:
            data &&
            data.archives &&
            data.archives.map((item) => ({
                title: item.title,
                description: `${item.desc}<br><img referrerpolicy="no-referrer" src="${item.pic}">`,
                pubDate: new Date(item.fav_at * 1000).toUTCString(),
                link: `https://www.bilibili.com/video/av${item.aid}`,
            })),
    };
};

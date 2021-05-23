const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const fid = ctx.params.fid;
    const uid = ctx.params.uid;
    const disableEmbed = ctx.params.disableEmbed;

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/medialist/gateway/base/spaceDetail?media_id=${fid}&pn=1&ps=20&keyword=&order=mtime&type=0&tid=0`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });
    const data = response.data.data;
    const userName = data.info.upper.name;
    const favName = data.info.title;

    ctx.state.data = {
        title: `${userName} 的 bilibili 收藏夹 ${favName}`,
        link: `https://space.bilibili.com/${uid}/#/favlist?fid=${fid}`,
        description: `${userName} 的 bilibili 收藏夹 ${favName}`,

        item:
            data.medias &&
            data.medias.map((item) => ({
                title: item.title,
                description: `${item.intro}${!disableEmbed ? `<br><br>${utils.iframe(item.id)}` : ''}<br><img src="${item.cover}">`,
                pubDate: new Date(item.fav_time * 1000).toUTCString(),
                link: item.fav_time > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.id}`,
                author: item.upper.name,
            })),
    };
};

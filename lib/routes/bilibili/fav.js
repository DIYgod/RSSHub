const got = require('@/utils/got');

module.exports = async (ctx) => {
    const fid = ctx.params.fid;
    const uid = ctx.params.uid;

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
            data &&
            data.medias &&
            data.medias.map((item) => ({
                title: item.title,
                description: `${item.intro}`,
                pubDate: new Date(item.fav_time * 1000).toUTCString(),
                link: `https://www.bilibili.com/${item.link.replace('bilibili://video/', 'video/av')}`,
            })),
    };
};

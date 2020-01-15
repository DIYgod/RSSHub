const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const url = `http://www.acfun.cn/bangumi/aa${id}`;

    const bangumiPage = await got({
        method: 'get',
        url,
        headers: {
            Referer: 'http://www.acfun.cn',
        },
    });
    const albumInfo = JSON.parse(bangumiPage.data.match(/window.bangumiData = (.*?);\n/)[1]) || {};
    const api = `http://www.acfun.cn/album/abm/bangumis/video?albumId=${id}&num=1&size=${albumInfo.itemCount || 9999}`;

    const response = await got({
        method: 'get',
        url: api,
        headers: {
            Referer: 'http://www.acfun.cn',
        },
    });
    const data = response.data.data;

    ctx.state.data = {
        title: albumInfo.bangumiTitle,
        link: url,
        description: albumInfo.bangumiIntro,
        item: data.content
            .map((item) => {
                const video = item.videos[0] || {};

                return {
                    title: `${video.episodeName}-${video.newTitle}`,
                    description: `<img src="${video.image}">`,
                    link: `http://www.acfun.cn/bangumi/ab${id}_${video.groupId}_${video.id}`,
                    pubDate: new Date(video.onlineTime).toUTCString(),
                };
            })
            .reverse(),
    };
};

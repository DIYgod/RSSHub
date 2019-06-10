const got = require('@/utils/got');

module.exports = async (ctx) => {
    const aid = ctx.params.aid;
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/view?aid=${aid}`,
        headers: {
            Referer: `https://www.bilibili.com/video/av${aid}`,
        },
    });

    const { title: name, pages: data } = response.data.data;

    ctx.state.data = {
        title: `视频 ${name} 的选集列表`,
        link: `https://www.bilibili.com/video/av${aid}`,
        description: `视频 ${name} 的视频选集列表`,
        item: data.map((item) => ({
            title: item.part,
            description: `${item.part} - ${name}`,
            pubDate: new Date().toUTCString(),
            link: `https://www.bilibili.com/video/av${aid}?p=${item.page}`,
        })),
    };
};

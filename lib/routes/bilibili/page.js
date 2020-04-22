const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { type, vid, linkVid } = utils.parseVid(ctx.params.vid);
    const disableEmbed = ctx.params.disableEmbed;

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/view?${type === 'aid' ? 'aid=' : 'bvid='}${vid}`,
        headers: {
            Referer: `https://www.bilibili.com/video/${linkVid}`,
        },
    });

    const { title: name, pages: data } = response.data.data;

    ctx.state.data = {
        title: `视频 ${name} 的选集列表`,
        link: `https://www.bilibili.com/video/${linkVid}`,
        description: `视频 ${name} 的视频选集列表`,
        item: data.map((item) => ({
            title: item.part,
            description: `${item.part} - ${name}${!disableEmbed ? `<br><br>${utils.iframe(vid, item.page)}` : ''}`,
            pubDate: new Date().toUTCString(),
            link: `https://www.bilibili.com/video/${linkVid}?p=${item.page}`,
        })),
    };
};

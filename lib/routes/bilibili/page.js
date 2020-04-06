const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    let aid = ctx.params.aid;
    if (/^[Bb][Vv]/.test(aid)) {
        aid = utils.bidToAid(aid);
    }
    const disableEmbed = ctx.params.disableEmbed;
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
            description: `${item.part} - ${name}${!disableEmbed ? `<br><br>${utils.iframe(aid, item.page)}` : ''}`,
            pubDate: new Date().toUTCString(),
            link: `https://www.bilibili.com/video/av${aid}?p=${item.page}`,
        })),
    };
};

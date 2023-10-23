const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    let bvid = ctx.params.bvid;
    let aid;
    if (!bvid.startsWith('BV')) {
        aid = bvid;
        bvid = null;
    }
    const disableEmbed = ctx.params.disableEmbed;
    const link = `https://www.bilibili.com/video/${bvid || `av${aid}`}`;
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/view?${bvid ? `bvid=${bvid}` : `aid=${aid}`}`,
        headers: {
            Referer: link,
        },
    });

    const { pic, title: name, pages: data } = response.data.data;

    ctx.state.data = {
        title: `视频 ${name} 的选集列表`,
        link,
        description: `视频 ${name} 的视频选集列表`,
        icon: pic,
        logo: pic,
        item: data
            .sort((a, b) => b.page - a.page)
            .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 10)
            .map((item) => ({
                title: item.part,
                cover: item.first_frame,
                description: `${item.part} - ${name}${!disableEmbed ? `<br><br>${utils.iframe(aid, item.page, bvid)}` : ''}`,
                link: `${link}?p=${item.page}`,
                _extra: {
                    intro: item.part,
                    duration: item.duration,
                    iframeUrl: utils.iframe(aid, item.page, bvid),
                },
            })),
    };
};

const got = require('@/utils/got');

module.exports = async (ctx) => {
    let seasonid = ctx.params.seasonid;
    const mediaid = ctx.params.mediaid;

    let mediaData;
    if (mediaid) {
        const response = await got({
            method: 'get',
            url: `https://www.bilibili.com/bangumi/media/md${mediaid}`,
        });
        mediaData = JSON.parse(response.data.match(/window\.__INITIAL_STATE__=([\s\S]+);\(function\(\)/)[1]) || {};
        seasonid = mediaData.mediaInfo.season_id;
    }
    const { data } = await got.get(`https://api.bilibili.com/pgc/web/season/section?season_id=${seasonid}`);

    ctx.state.data = {
        title: mediaData.mediaInfo.chn_name,
        link: `https://www.bilibili.com/bangumi/media/md${mediaData.mediaInfo.media_id}/`,
        image: mediaData.mediaInfo.cover,
        description: mediaData.mediaInfo.evaluate,
        item:
            data.result.main_section.episodes &&
            data.result.main_section.episodes.map((item, index) => ({
                title: `第${index + 1}话 ${item.long_title}`,
                description: `<img src="${item.cover}">`,
                link: `https://www.bilibili.com/bangumi/play/ep${item.id}`,
            })),
    };
};

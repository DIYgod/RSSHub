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

    let episodes = [];
    if (data.result.main_section && data.result.main_section.episodes) {
        episodes = episodes.concat(
            data.result.main_section.episodes.map((item) => ({
                title: `第${item.title}话 ${item.long_title}`,
                description: `<img src="${item.cover}">`,
                link: `https://www.bilibili.com/bangumi/play/ep${item.id}`,
            }))
        );
    }

    if (data.result.section) {
        data.result.section.forEach((section) => {
            if (section.episodes) {
                episodes = episodes.concat(
                    section.episodes.map((item) => ({
                        title: `${item.title} ${item.long_title}`,
                        description: `<img src="${item.cover}">`,
                        link: `https://www.bilibili.com/bangumi/play/ep${item.id}`,
                    }))
                );
            }
        });
    }

    ctx.state.data = {
        title: mediaData.mediaInfo.title,
        link: `https://www.bilibili.com/bangumi/media/md${mediaData.mediaInfo.media_id}/`,
        image: mediaData.mediaInfo.cover,
        description: mediaData.mediaInfo.evaluate,
        item: episodes,
    };
};

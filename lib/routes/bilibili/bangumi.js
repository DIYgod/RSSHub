const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const seasonid = ctx.params.seasonid;
    const mediaid = ctx.params.mediaid;

    let data;
    if (mediaid) {
        const response = await axios({
            method: 'get',
            url: `https://www.bilibili.com/bangumi/media/md${mediaid}`,
        });
        data = JSON.parse(response.data.match(/window\.__INITIAL_STATE__=([\s\S]+);\(function\(\)/)[1]) || {};
    } else if (seasonid) {
        const response = await axios({
            method: 'get',
            url: `https://bangumi.bilibili.com/anime/${seasonid}`,
        });
        data = JSON.parse(response.data.match(/window\.__INITIAL_STATE__=([\s\S]+);\(function\(\)/)[1]) || {};
    }

    ctx.state.data = {
        title: data.mediaInfo.chn_name,
        link: `https://www.bilibili.com/bangumi/media/md${data.mediaInfo.media_id}/`,
        image: data.mediaInfo.cover,
        description: data.mediaInfo.evaluate,
        item:
            data.mediaInfo.episodes &&
            data.mediaInfo.episodes.reverse().map((item) => ({
                title: `第${item.index}话 ${item.index_title}`,
                description: `更新时间：${item.pub_real_time} <img referrerpolicy="no-referrer" src="${item.cover}@320w_200h">`,
                pubDate: new Date(item.pub_real_time).toUTCString(),
                link: `https://www.bilibili.com/bangumi/play/ep${item.ep_id}`,
            })),
    };
};

const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const seasonid = ctx.params.seasonid;
    const response = await axios({
        method: 'get',
        url: `https://www.bilibili.com/bangumi/play/ss${seasonid}`,
    });

    const data = JSON.parse(response.data.match(/window\.__INITIAL_STATE__=([\s\S]+);\(function\(\)/)[1]) || {};

    ctx.state.data = {
        title: data.mediaInfo.title,
        link: `https://bangumi.bilibili.com/anime/${seasonid}/`,
        description: data.mediaInfo.evaluate,
        item:
            data.epList &&
            data.epList.reverse().map((item) => ({
                title: `第${item.index}话 ${item.index_title}`,
                description: `更新时间：${item.pub_real_time}<img referrerpolicy="no-referrer" src="${item.cover}">`,
                pubDate: new Date(item.pub_real_time).toUTCString(),
                link: `https://www.bilibili.com/bangumi/play/ep${item.ep_id}`,
            })),
    };
};

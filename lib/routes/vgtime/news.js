const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: `http://www.vgtime.com/vgtime-app/api/v2/homepage/listByTag.json?page=1&pageSize=20&tags=1`,
    });
    const data = response.data.data.topicList;

    ctx.state.data = {
        title: `游戏时光新闻列表`,
        link: `http://www.vgtime.com/topic/index.jhtml`,
        item: data.map((item) => ({
            title: item.title,
            description: `作者：${item.user.name}`,
            pubDate: new Date(item.publishDate * 1000).toUTCString(),
            link: item.shareUrl,
        })),
    };
};

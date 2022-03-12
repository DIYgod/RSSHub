const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const utils = require('./utils');

module.exports = async (ctx) => {
    const disableEmbed = ctx.params.disableEmbed;

    const response = await got({
        method: 'get',
        url: 'https://www.bilibili.com/video/online.html',
    });
    const onlineList = JSON.parse(response.data.match(/window\.__INITIAL_STATE__=([\s\S]+);\(function\(\)/)[1]).onlineList || [];

    ctx.state.data = {
        title: '哔哩哔哩 - 当前在线',
        link: 'https://www.bilibili.com/video/online.html',
        item: onlineList.map((item) => ({
            title: item.title,
            description: `${item.desc || item.title}${!disableEmbed ? `<br><br>${utils.iframe(item.aid, null, item.bvid)}` : ''}<br><img src="${item.pic}">`,
            pubDate: parseDate(item.pubdate * 1000),
            author: item.owner.name,
            link: `https://www.bilibili.com/video/${item.bvid}`,
        })),
    };
};

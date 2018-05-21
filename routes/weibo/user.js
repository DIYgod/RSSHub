const axios = require('../../utils/axios');
const config = require('../../config');
const weiboUtils = require('./utils');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const containerResponse = await axios({
        method: 'get',
        url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}`,
        headers: {
            'User-Agent': config.ua,
            Referer: 'https://m.weibo.cn/',
        },
    });
    const name = containerResponse.data.data.userInfo.screen_name;
    const containerid = containerResponse.data.data.tabsInfo.tabs[1].containerid;

    const response = await axios({
        method: 'get',
        url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}&containerid=${containerid}`,
        headers: {
            'User-Agent': config.ua,
            Referer: `https://m.weibo.cn/u/${uid}`,
        },
    });

    ctx.state.data = {
        title: `${name}的微博`,
        link: `http://weibo.com/${uid}/`,
        description: `${name}的微博`,
        item: response.data.data.cards.filter((item) => item.mblog && !item.mblog.isTop).map((item) => {
            const title = item.mblog.text.replace(/<.*?>/g, '');
            return {
                title: title.length > 24 ? title.slice(0, 24) + '...' : title,
                description: weiboUtils.format(item.mblog),
                pubDate: weiboUtils.getTime(item.mblog.created_at),
                link: `https://weibo.com/${uid}/${item.mblog.bid}`,
            };
        }),
    };
};

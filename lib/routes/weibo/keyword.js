const axios = require('../../utils/axios');
const weiboUtils = require('./utils');
const date = require('../../utils/date');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;

    const response = await axios({
        method: 'get',
        url: `https://m.weibo.cn/api/container/getIndex?containerid=100103type%3D61%26q%3D${encodeURIComponent(keyword)}%26t%3D0`,
        headers: {
            Referer: `https://m.weibo.cn/p/searchall?containerid=100103type%3D1%26q%3D${encodeURIComponent(keyword)}`,
        },
    });
    const data = response.data.data.cards[0].card_group;

    ctx.state.data = {
        title: `又有人在微博提到${keyword}了`,
        link: `http://s.weibo.com/weibo/${encodeURIComponent(keyword)}&b=1&nodup=1`,
        description: `又有人在微博提到${keyword}了`,
        item: data.map((item) => {
            const title = item.mblog.text.replace(/<img.*?>/g, '[图片]').replace(/<.*?>/g, '');
            return {
                title: `${item.mblog.user.screen_name}: ${title}`,
                description: `${item.mblog.user.screen_name}: ${weiboUtils.format(item.mblog)}`,
                pubDate: date(item.mblog.created_at, 8),
                link: `https://weibo.com/${item.mblog.user.id}/${item.mblog.bid}`,
            };
        }),
    };
};

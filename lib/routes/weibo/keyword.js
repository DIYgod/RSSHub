const got = require('@/utils/got');
const weiboUtils = require('./utils');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;

    const response = await got({
        method: 'get',
        url: `https://m.weibo.cn/api/container/getIndex?containerid=100103type%3D61%26q%3D${encodeURIComponent(keyword)}%26t%3D0`,
        headers: {
            Referer: `https://m.weibo.cn/p/searchall?containerid=100103type%3D1%26q%3D${encodeURIComponent(keyword)}`,
            'MWeibo-Pwa': 1,
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        },
    });
    const data = response.data.data.cards;

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

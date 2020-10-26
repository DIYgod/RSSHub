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
            item.mblog.created_at = date(item.mblog.created_at, 8);
            if (item.mblog.retweeted_status && item.mblog.retweeted_status.created_at) {
                item.mblog.retweeted_status.created_at = date(item.mblog.retweeted_status.created_at, 8);
            }
            const formatExtended = weiboUtils.formatExtended(ctx, item.mblog, {
                showAuthorInTitle: true,
                showAuthorInDesc: true,
            });
            const title = formatExtended.title;
            const description = formatExtended.description;
            return {
                title: title,
                description: description,
                pubDate: date(item.mblog.created_at, 8),
                link: `https://weibo.com/${item.mblog.user.id}/${item.mblog.bid}`,
            };
        }),
    };
};

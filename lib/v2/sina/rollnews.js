const got = require('@/utils/got');
const { parseRollNewsList, parseArticle } = require('./utils');

module.exports = async (ctx) => {
    const { lid = '2509' } = ctx.params;
    const { limit = 50 } = ctx.query;
    const response = await got(`https://feed.mix.sina.com.cn/api/roll/get`, {
        headers: {
            referer: 'https://news.sina.com.cn/roll/',
        },
        searchParams: {
            pageid: 153,
            lid,
            k: '',
            num: limit,
            page: 1,
            r: Math.random(),
            _: new Date().getTime(),
        },
    });
    const list = parseRollNewsList(response.data.result.data);

    const out = await Promise.all(list.map((item) => parseArticle(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: '新浪滚动新闻',
        link: `https://news.sina.com.cn/roll/#pageid=153&lid=${lid}&k=&num=50&page=1`,
        item: out,
    };
};

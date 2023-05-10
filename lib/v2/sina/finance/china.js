const got = require('@/utils/got');
const { parseRollNewsList, parseArticle } = require('../utils');

module.exports = async (ctx) => {
    const map = {
        1686: '国内滚动',
        1687: '宏观经济',
        1690: '金融新闻',
        1688: '地方经济',
        1689: '部委动态',
        3231: '今日财经 TOP10',
    };

    const { lid = '1686' } = ctx.params;
    const { limit = 50 } = ctx.query;
    const response = await got('https://feed.mix.sina.com.cn/api/roll/get', {
        headers: {
            referer: 'https://news.sina.com.cn/roll/',
        },
        searchParams: {
            pageid: 155,
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
        title: `新浪财经－${map[lid]}`,
        link: 'http://finance.sina.com.cn/china/',
        item: out,
    };
};

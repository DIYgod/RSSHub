const got = require('@/utils/got');
const { parseRollNewsList, parseArticle } = require('./utils');

module.exports = async (ctx) => {
    const { limit = 50 } = ctx.query;
    const response = await got('https://feed.mix.sina.com.cn/api/roll/get', {
        headers: {
            referer: 'https://news.sina.com.cn/roll/',
        },
        searchParams: {
            pageid: 402,
            lid: 2559,
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
        title: '新浪专栏-创事记',
        link: 'https://tech.sina.com.cn/chuangshiji',
        item: out,
    };
};

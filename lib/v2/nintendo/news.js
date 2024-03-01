const got = require('@/utils/got');
const util = require('./utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got('https://www.nintendo.com.hk/data/json/topics.json');
    const data = response.data.filter((val) => val.only_for !== 'tw' && val.url.startsWith('/topics/article/')).slice(0, ctx.query.limit ? Number(ctx.query.limit) : 30);

    // 获取新闻正文
    const result = await util.ProcessNews(data, ctx.cache);

    ctx.state.data = {
        title: 'Nintendo（香港）主页资讯',
        link: 'https://www.nintendo.com.hk/topics/',
        description: 'Nintendo 香港有限公司官网刊登的资讯',
        item: result.map((item) => ({
            title: item.title,
            description: item.content,
            link: `https://www.nintendo.com.hk${item.url}`,
            pubDate: parseDate(item.release_date, 'YYYY.M.D'),
        })),
    };
};

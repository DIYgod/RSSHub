const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, parseArticle } = require('./utils');

const rangeMap = {
    daily: '日榜',
    weekly: '周榜',
    monthly: '月榜',
};

module.exports = async (ctx) => {
    const { range = 'daily' } = ctx.params;
    const { data: response } = await got(`${baseUrl}/api2/app/article/popular/${range}`);

    const list = response.RESULT.map((item) => {
        item = item.data;
        return {
            title: item.articleTitle,
            description: item.articleSummary,
            link: `${baseUrl}/${item.type}/${item.id}.html`,
            pubDate: parseDate(item.publishTime, 'x'),
            author: item.articleAuthor,
        };
    });

    const result = await Promise.all(list.map((item) => parseArticle(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `热门文章 - ${rangeMap[range]} - 人人都是产品经理`,
        link: baseUrl,
        item: result,
    };
};

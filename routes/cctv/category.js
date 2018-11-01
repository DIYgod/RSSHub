module.exports = async (ctx) => {
    const { category } = ctx.params;
    let responseData;

    if (category === 'mzzlbg') {
        // 每周质量报告
        const getMzzlbg = require('./utils/mzzlbg');
        responseData = await getMzzlbg();
    } else {
        // 央视新闻
        const getNews = require('./utils/news');
        responseData = await getNews(category, ctx);
    }

    ctx.state.data = responseData;
};

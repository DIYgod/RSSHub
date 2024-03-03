// @ts-nocheck
export default async (ctx) => {
    const category = ctx.req.param('category');
    let responseData;

    if (category === 'mzzlbg') {
        // 每周质量报告
        const getMzzlbg = require('./utils/mzzlbg');
        responseData = await getMzzlbg();
    } else if (category === 'xinwen1j1') {
        // 新闻1+1
        const xinwen1j1 = require('./utils/xinwen1j1');
        responseData = await xinwen1j1();
    } else {
        // 央视新闻
        const getNews = require('./utils/news');
        responseData = await getNews(category);
    }

    ctx.set('data', responseData);
};

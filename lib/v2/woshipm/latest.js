const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, parseArticle } = require('./utils');

module.exports = async (ctx) => {
    const pages = 3;
    const urlList = Array.from({ length: pages }, (_, v) => `${baseUrl}/__api/v1/stream-list${v < 1 ? '' : `/page/${v + 1}`}`);
    const responses = await got.all(urlList.map((url) => got(url)));

    const payload = responses.map((response) => response.data.payload).flat();

    const list = payload.map((item) => ({
        title: item.title,
        description: item.snipper,
        link: item.permalink,
        pubDate: parseDate(item.date, 'YYYY/MM/DD'),
        author: item.author.name,
    }));

    const result = await Promise.all(list.map((item) => parseArticle(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: '最新文章 - 人人都是产品经理',
        link: baseUrl,
        item: result,
    };
};

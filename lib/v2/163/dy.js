const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { parseDyArticle } = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const response = await got(`https://dy.163.com/v2/article/list.do?pageNo=1&wemediaId=${id}&size=10`);
    const charset = response.headers['content-type'].split('=')[1];

    const list = response.data.data.list.map((e) => ({
        title: e.title,
        link: 'https://www.163.com/dy/article/' + e.docid + '.html',
        pubDate: timezone(parseDate(e.ptime), 8),
        author: e.source,
        imgsrc: e.imgsrc,
    }));

    const items = await Promise.all(list.map((e) => parseDyArticle(charset, e, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `网易号 - ${list[0].author}`,
        link: items[0].feedLink,
        description: items[0].feedDescription,
        image: items[0].feedImage,
        item: items,
    };
};

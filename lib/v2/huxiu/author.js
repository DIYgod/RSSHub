const got = require('@/utils/got');
const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `https://www.huxiu.com/member/${id}/article.html`;

    const articleList = await got({
        method: 'post',
        url: 'https://account-api.huxiu.com/web/article/articleList',
        form: {
            platform: 'www',
            uid: id,
            type: 0,
            page: 1,
        },
    }).json();

    const list = articleList.data.datalist.map((item) => ({
        title: item.title,
        link: `https://www.huxiu.com/article/${item.aid}.html`,
        description: item.summary,
        pubDate: parseDate(item.time),
    }));

    const items = await utils.ProcessFeed(list, ctx.cache);

    const authorInfo = `虎嗅网 - ${items[0].author}`;

    ctx.state.data = {
        title: authorInfo,
        link,
        item: items,
    };
};

const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `${utils.baseUrl}/member/${id}/article.html`;

    const articleList = await got({
        method: 'post',
        url: `${utils.accountApi}/web/article/articleList`,
        form: {
            platform: 'www',
            uid: id,
            type: 0,
            page: 1,
        },
    }).json();

    const list = articleList.data.datalist.map((item) => ({
        title: item.title,
        link: `${utils.baseUrl}/article/${item.aid}.html`,
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

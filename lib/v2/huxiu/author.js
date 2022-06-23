const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `https://www.huxiu.com/member/${id}/article.html`;

    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: link,
        },
    });

    const $ = cheerio.load(response.data);
    const author = $('.author-name').text().trim();

    const articleList = await got({
        method: 'post',
        url: 'https://account-api.huxiu.com/web/article/articleList',
        headers: {
            Referer: 'https://www.huxiu.com/',
        },
        form: {
            platform: 'www',
            uid: id,
            type: 0,
            page: 1,
        },
    }).json();

    const list = articleList.data.datalist.slice(0, 10).map((item) => item.url);

    const items = await utils.ProcessFeed(list, ctx.cache);

    const authorInfo = `虎嗅网 - ${author}`;
    ctx.state.data = {
        title: authorInfo,
        link,
        description: authorInfo,
        item: items,
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const FormData = require('form-data');

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

    const form = new FormData();
    form.append('platform', 'www');
    form.append('uid', id);
    form.append('type', 0);
    form.append('page', 1);

    const articleList = await got({
        method: 'post',
        url: 'https://account-api.huxiu.com/web/article/articleList',
        headers: {
            Referer: 'https://www.huxiu.com/',
        },
        body: form,
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

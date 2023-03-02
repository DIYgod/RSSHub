const cheerio = require('cheerio');
const got = require('@/utils/got');
const { baseUrl, getArticleList, getArticle } = require('./utils');

module.exports = async (ctx) => {
    const { journal = 'nature' } = ctx.params;
    const url = `${baseUrl}/${journal}/articles?type=research-highlight`;

    const res = await got(url);
    const $ = cheerio.load(res.data);

    let items = getArticleList($);

    items = await Promise.all(items.map((item) => getArticle(item, ctx)));

    ctx.state.data = {
        title: $('title').text().trim(),
        description: $('meta[name=description]').attr('content'),
        link: url,
        item: items,
    };
};

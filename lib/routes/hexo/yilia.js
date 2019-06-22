const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `http://${ctx.params.url}`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const authorInfo = $('.left-col').find('#header');
    const title = authorInfo.find('.header-author').text();
    const subtitle = authorInfo.find('.header-subtitle').text();
    const articleNodeList = $('article');
    const articles = Array.from(articleNodeList).map((article) => {
        const each = $(article);
        const titleEl = each.find('.article-title');

        return {
            title: titleEl.text(),
            link: encodeURI(`${url}${titleEl.attr('href')}`),
            description: each.find('.article-entry').text(),
            pubDate: each.find('time').attr('datetime'),
        };
    });

    ctx.state.data = {
        title,
        link: url,
        description: subtitle,
        item: articles,
    };
};

/* eslint-disable array-callback-return */
const cheerio = require('cheerio');
const got = require('@/utils/got');
module.exports = async (ctx) => {
    const url = `https://${ctx.params.url}`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const title = $('[property="og:title"]').attr('content');
    const auther = $('[name="author"]').attr('content');
    const subtitle = $('[name="description"]').attr('content');
    const articleNodeList = $('#recent-posts .recent-post-item');
    const articles = [];
    Array.from(articleNodeList).map(function (article) {
        const each = $(article);
        const title = each.find('.article-title').text();
        const link = encodeURI(`${url}${each.find('.article-title').attr('href')}`);
        const description = each.find('.content').text();
        const pubDate = each.find('time').attr('datetime');
        title &&
            title.length &&
            articles.push({
                title,
                link,
                description,
                pubDate,
            });
    });
    return (ctx.state.data = {
        title,
        link: url,
        description: subtitle,
        item: articles,
        auther,
    });
};

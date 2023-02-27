const got = require('@/utils/got');
const { parseRelativeDate, parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');

const parseArticle = (item, ctx) => {
    const articleUrl = `https://aijishu.com/a/${item.id}`;
    return ctx.cache.tryGet(articleUrl, async () => {
        const resp = await got(articleUrl);
        const $ = cheerio.load(resp.data);

        const d1 = parseDate(item.createdDate, 'YYYY-MM-DD');
        const d2 = parseRelativeDate(item.createdDate);
        const article_item = {
            title: item.title,
            link: articleUrl,
            description: $('article.fmt').html(),
            pubDate: d1.toString() === 'Invalid Date' ? d2 : d1,
        };

        return article_item;
    });
};

module.exports = {
    parseArticle,
};

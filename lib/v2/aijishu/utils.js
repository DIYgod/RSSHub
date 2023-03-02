const got = require('@/utils/got');
const { parseRelativeDate, parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');

const parseArticle = (item, ctx) => {
    const articleUrl = `https://aijishu.com${item.url || item.object.url}`;
    return ctx.cache.tryGet(articleUrl, async () => {
        const d1 = parseDate(item.createdDate, ['YYYY-MM-DD', 'M-DD']);
        const d2 = parseRelativeDate(item.createdDate);

        let resp, desc;
        try {
            resp = await got(articleUrl);
            const $ = cheerio.load(resp.data);
            desc = $('article.fmt').html();
        } catch (e) {
            if (e.response.status === 403) {
                // skip it
            } else {
                throw e;
            }
        }

        const article_item = {
            title: item.title || item.object.title,
            link: articleUrl,
            description: desc,
            pubDate: d1.toString() === 'Invalid Date' ? d2 : d1,
        };
        return article_item;
    });
};

module.exports = {
    parseArticle,
};

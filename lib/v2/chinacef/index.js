const utils = require('./utils');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.chinacef.cn';
    const regex = /^\/index\.php\/index\/article\/article_id\/\d+/g;
    const timeRegex = /(\d{4}-\d{2}-\d{2})/g;

    const response = await got({
        method: 'get',
        url: rootUrl,
    });
    const $ = cheerio.load(response.data);

    const articlesLinkListNode = $('a[target=_black]')
        .filter((_, item) => item.attribs.href.match(regex))
        .map((_, item) => item.attribs.href);
    const articlesLinkList = Array.from(new Set(articlesLinkListNode));

    const out = await Promise.all(
        articlesLinkList.map(async (item) => {
            const articlesLink = rootUrl + item;
            const $ = await await ctx.cache.tryGet(articlesLink, async () => {
                const response = await got({
                    method: 'get',
                    url: articlesLink,
                });
                return cheerio.load(response.data);
            });

            // Clean article style
            $('*[style]').removeAttr('style');
            $('br').remove();
            $('span:empty').remove();
            $('p:empty').remove();
            $('p').each((_, el) => {
                if ($(el).html().trim() === '') {
                    $(el).remove();
                }
            });

            const title = $('span[class=contenttitle]').first().text().trim();
            const author = $('a[rel=author]').first().text().trim();
            const time = $('a[rel=author]').parent().text().match(timeRegex)[0];
            const pubDate = parseDate(time, 'YYYY-MM-DD');
            const description = $('div[class=newsmaintext]').html();

            const element = {
                title,
                author,
                pubDate,
                description: utils.renderDesc(description),
                link: articlesLink,
            };
            return element;
        })
    );

    ctx.state.data = {
        title: '首席经济学家论坛',
        description: '首席经济学家最近更新的文章',
        link: rootUrl,
        item: out,
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');
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
            const cache = await ctx.cache.get(articlesLink);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: articlesLink,
            });
            const $ = cheerio.load(response.data);

            const title = $('span[class=contenttitle]').first().text().trim();
            const author = $('a[rel=author]').first().text().trim();
            const time = $('a[rel=author]').parent().text().match(timeRegex)[0];
            const pubDate = parseDate(time, 'YYYY-MM-DD');

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

            const description = $('div[class=newsmaintext]').html();
            const element = {
                title,
                author,
                pubDate,
                description,
                link: articlesLink,
            };
            ctx.cache.set(articlesLink, JSON.stringify(element));
            return Promise.resolve(element);
        })
    );
    ctx.state.data = {
        title: '首席经济学家论坛',
        link: rootUrl,
        item: out,
    };
};

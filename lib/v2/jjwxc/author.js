const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const rootUrl = 'https://www.jjwxc.net';
    const currentUrl = new URL(`oneauthor.php?authorid=${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response, 'gbk'));

    const bookEl = $('font a').first();
    const bookInfoEl = bookEl.parent();

    const bookName = bookEl.text();
    const bookUrl = new URL(bookEl.prop('href'), rootUrl).href;
    const bookStatus = bookInfoEl.find('font').first().text();
    const bookWords = bookInfoEl.find('font').eq(1).text();
    const bookUpdatedTime = bookInfoEl.parent().contents().last().text().trim();
    const bookId = bookUrl.split(/=/).pop();

    const title = `${bookName}(${bookStatus}/${bookWords}/${bookUpdatedTime})`;
    const author = $('span[itemprop="name"]').text();

    const items = [
        {
            title,
            link: bookUrl,
            description: art(path.join(__dirname, 'templates/author.art'), {
                bookName,
                bookUrl,
                bookStatus,
                bookWords,
                bookUpdatedTime,
            }),
            author,
            category: [bookStatus],
            guid: `jjwxc-${id}-${bookId}#${bookWords}`,
            pubDate: timezone(parseDate(bookUpdatedTime), +8),
        },
    ];

    const logoEl = $('div.logo a img');
    const image = `https:${logoEl.prop('src')}`;
    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${logoEl.prop('alt').replace(/logo/, '')} | ${author} - 最近更新`,
        link: currentUrl,
        description: $('span[itemprop="description"]').text(),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="Description"]').prop('content'),
        author,
    };
};

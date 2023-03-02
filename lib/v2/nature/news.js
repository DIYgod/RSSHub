const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, getArticle } = require('./utils');

module.exports = async (ctx) => {
    const url = `${baseUrl}/latest-news`;
    const res = await got(url);
    const $ = cheerio.load(res.data);

    let items = $('.c-article-item__content')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3').text(),
                link: baseUrl + item.find('a').attr('href'),
                pubDate: parseDate(item.find('.c-article-item__date').text()),
            };
        });

    items = await Promise.all(items.map((item) => ctx.cache.tryGet(item.link, () => getArticle(item, ctx))));

    ctx.state.data = {
        title: 'Nature | Latest News',
        description: $('meta[name=description]').attr('content'),
        link: url,
        item: items,
    };
};

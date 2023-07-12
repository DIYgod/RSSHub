const got = require('@/utils/got');
const cheerio = require('cheerio');
const { CookieJar } = require('tough-cookie');
const { baseUrl, parseArticle } = require('./utils');

module.exports = async (ctx) => {
    const cookieJar = new CookieJar();
    const { category = '' } = ctx.params;
    const link = `${baseUrl}/posts${category ? `/${category}` : ''}`;

    const response = await got({
        url: link,
        headers: {
            Referer: baseUrl,
        },
        cookieJar,
    });

    const $ = cheerio.load(response.data);

    let items = $('.ag-post-item__link')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text().trim(),
                link: `${baseUrl}${item.attr('href')}`,
            };
        });

    items = await Promise.all(items.map((item) => ctx.cache.tryGet(item.link, () => parseArticle(item, link, cookieJar))));

    ctx.state.data = {
        title: $('head title').text().trim(),
        link,
        description: $('head meta[name=description]').attr('content'),
        item: items,
        language: $('html').attr('lang'),
    };

    ctx.state.json = {
        title: $('head title').text().trim(),
        link,
        description: $('head meta[name=description]').attr('content'),
        item: items,
        language: $('html').attr('lang'),
        cookieJar,
    };
};

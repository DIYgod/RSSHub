const got = require('@/utils/got');
const cheerio = require('cheerio');
const { baseUrl, parseArticle } = require('./utils');

module.exports = async (ctx) => {
    const { topic } = ctx.params;
    const link = `${baseUrl}/topic/${topic}`;
    const response = await got({
        url: link,
        headers: {
            Referer: baseUrl,
        },
    });

    const $ = cheerio.load(response.data);
    const ldJson = JSON.parse($('script[type="application/ld+json"]').text());
    let items = $('.ag-post-item__link')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text().trim(),
                link: `${baseUrl}${item.attr('href')}`,
            };
        });

    items = await Promise.all(items.map((item) => ctx.cache.tryGet(item.link, () => parseArticle(item, link, undefined))));

    ctx.state.data = {
        title: $('head title').text().trim(),
        link,
        description: ldJson['@graph'][0].description,
        item: items,
        language: $('html').attr('lang'),
    };

    ctx.state.json = {
        title: $('head title').text().trim(),
        link,
        description: ldJson['@graph'][0].description,
        item: items,
        language: $('html').attr('lang'),
    };
};

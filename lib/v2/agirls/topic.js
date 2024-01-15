const got = require('@/utils/got');
const cheerio = require('cheerio');
const { baseUrl, parseArticle } = require('./utils');

module.exports = async (ctx) => {
    const { topic } = ctx.params;
    const link = `${baseUrl}/topic/${topic}`;
    const response = await got(link);

    const $ = cheerio.load(response.data);
    const ldJson = JSON.parse($('script[type="application/ld+json"]').text());
    const list = $('.ag-post-item__link')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text().trim(),
                link: `${baseUrl}${item.attr('href')}`,
            };
        });

    const items = await Promise.all(list.map((item) => ctx.cache.tryGet(item.link, () => parseArticle(item))));

    ctx.state.data = {
        title: $('head title').text().trim(),
        link,
        description: ldJson['@graph'][0].description,
        item: items,
        language: $('html').attr('lang'),
    };
};

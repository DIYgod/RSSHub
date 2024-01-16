const got = require('@/utils/got');
const cheerio = require('cheerio');
const { baseUrl, parseArticle } = require('./utils');

module.exports = async (ctx) => {
    const { category = '' } = ctx.params;
    const link = `${baseUrl}/posts${category ? `/${category}` : ''}`;
    const response = await got(link);

    const $ = cheerio.load(response.data);

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
        description: $('head meta[name=description]').attr('content'),
        item: items,
        language: $('html').attr('lang'),
    };
};

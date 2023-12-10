const got = require('@/utils/got');
const cheerio = require('cheerio');
const { baseUrl } = require('./utils');

module.exports = async (ctx) => {
    const category = 'topic';
    const link = `${baseUrl}/${category}`;

    const response = await got({
        url: `${baseUrl}/${category}`,
        headers: {
            Referer: baseUrl,
        },
    });

    const $ = cheerio.load(response.data);

    const items = $('.ag-topic')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.ag-topic__link').text().trim(),
                description: item.find('.ag-topic__summery').text().trim(),
                link: `${baseUrl}${item.find('.ag-topic__link').attr('href')}`,
            };
        });

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
    };
};

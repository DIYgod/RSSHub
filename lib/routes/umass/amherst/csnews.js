const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.cics.umass.edu/news',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.view-mt-latest-news .views-row');
    let itemPicUrl;
    ctx.state.data = {
        title: 'UMAmherst-CSNews',
        link: 'https://www.cics.umass.edu/news',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item.find('.views-field-field-image img').attr('src');
                    return {
                        title: item.find('.views-field-title a').first().text(),
                        description: `<img src="${itemPicUrl}"><br/>` + item.find('.views-field-body .field-content').first(),
                        link: item.find('.views-more-link').attr('href'),
                    };
                })
                .get(),
    };
};

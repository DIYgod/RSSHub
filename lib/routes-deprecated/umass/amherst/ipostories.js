const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.umass.edu/ipo/iss/featured-stories',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.view-content .individualNews');
    let itemPicUrl;

    ctx.state.data = {
        title: 'UMAmherst-IpoStories',
        link: 'https://www.umass.edu/ipo/iss/featured-stories',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item.find('.views-field-field-image img').attr('src');

                    return {
                        title: item.find('.views-field-title a').first().text(),
                        description: `<img src="${itemPicUrl}"><br/>` + item.find('.views-field-field-news-body .field-content').first(),
                        link: item.find('.views-field-title a').attr('href'),
                    };
                })
                .get(),
    };
};

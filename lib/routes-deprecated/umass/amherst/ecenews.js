const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://ece.umass.edu/news',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.view-news .views-row');
    let itemPicUrl;

    ctx.state.data = {
        title: 'UMAmherst-ECENews',
        link: 'https://ece.umass.edu/news',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item.find('.image-style-thumbnail').attr('src');
                    return {
                        title: item.find('.views-field-title a').first().text(),
                        description: `<img src="${itemPicUrl}"><br/>` + item.find('div.field-content').last(),
                        link: item.find('.views-field-title a').attr('href'),
                    };
                })
                .get(),
    };
};

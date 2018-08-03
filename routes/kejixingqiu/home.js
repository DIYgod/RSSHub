const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://www.xincheng.tv',
        headers: {
            'User-Agent': config.ua,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.l-news_item');

    ctx.state.data = {
        title: $('title').text(),
        link: 'http://www.xincheng.tv',
        description: $('meta[name="description"]').attr('content'),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: `${item.find('.sub1-titile2').text()} - ${item.find('.sub1-titile1').text()}`,
                        description: item.find('.sub1-new-item').text(),
                        link: `http://www.xincheng.tv${item
                            .find('.sub1-titile2')
                            .parent()
                            .attr('href')}`,
                    };
                })
                .get(),
    };
};
